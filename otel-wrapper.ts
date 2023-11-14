import { trace, type Span } from "@opentelemetry/api";
import { NextApiRequest, NextApiResponse } from "next";
import { sdk } from "./my-instrumentation";

function stripUrlQueryAndFragment(urlPath: string): string {
  return urlPath.split(/[\?#]/, 1)[0];
}

function getReqPath(req: NextApiRequest) {
  const url = `${req.url}`;
  let reqPath = stripUrlQueryAndFragment(url);
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      reqPath = reqPath.replace(`${value}`, `[${key}]`);
    }
  }
}

export type NextOtelApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  span: Span | undefined,
) => unknown | Promise<unknown>;

export const withOtel = async (handler: NextOtelApiHandler, name?: string) => {
  return new Proxy(handler, {
    apply: (
      wrappingTarget,
      thisArg,
      args: [NextApiRequest | undefined, NextApiResponse | undefined],
    ) => {
      const [req, res] = args;
      if (!req) {
        console.log("No request object found, OTEL is not set-up");
        return wrappingTarget.apply(thisArg, args);
      }
      if (!res) {
        console.log("No response object found, OTEL is not set-up");
        return wrappingTarget.apply(thisArg, args);
      }

      const boundHandler = async () => {
        sdk.start();
        const requestId =
          (req.headers["x-vercel-proxy-signature-ts"] as string) ??
          "<unknown-request-id>";
        const reqPath = name ?? getReqPath(req);
        const reqMethod = `${(req.method || "GET").toUpperCase()} `;

        const span = trace
          .getTracer("example-otel-app")
          .startSpan(`${reqMethod} ${reqPath}`);
        span.setAttribute("requestId", requestId);

        const originalResEnd = res.end;
        // @ts-expect-error - this is a hack to get around Vercel freezing lambda's
        res.end = async function (this: unknown, ...args: unknown[]) {
          span.end();
          await sdk.shutdown();

          originalResEnd.apply(this, args);
        };

        try {
          const handlerResult = await wrappingTarget.apply(thisArg, [
            ...args,
            span,
          ]);
          return handlerResult;
        } catch (e) {
          // TODO: Do something with error

          // Error won't be passed onto next.js, it didn't have time to set the status code and status message yet
          res.statusCode = 500;
          res.statusMessage = "Internal Server Error";

          span.end();
          await sdk.shutdown();

          // Throw original error
          throw e;
        }
      };

      return boundHandler;
    },
  });
};