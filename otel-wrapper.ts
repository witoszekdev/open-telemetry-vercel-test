import { SpanKind, trace, type Span } from "@opentelemetry/api";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { NextApiRequest, NextApiResponse } from "next";
import { spanProcessor } from "./utils";

function stripUrlQueryAndFragment(urlPath: string): string {
  return urlPath.split(/[\?#]/, 1)[0];
}

function getRequestPath(req: NextApiRequest) {
  const url = req.url ?? "";
  let reqPath = stripUrlQueryAndFragment(url);
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      reqPath = reqPath.replace(`${value}`, `[${key}]`);
    }
  }
  return reqPath;
}

export type NextOtelApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  span: Span | undefined,
) => unknown | Promise<unknown>;

export const withOtel = (
  handler: NextOtelApiHandler,
  routeName: string,
): NextOtelApiHandler => {
  return new Proxy(handler, {
    apply: async (
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

      // sdk.start();
      const requestId =
        (req.headers["x-vercel-proxy-signature-ts"] as string) ??
        "<unknown-request-id>";
      const reqMethod = `${(req.method || "GET").toUpperCase()} `;

      return await trace.getTracer("example-otel-app").startActiveSpan(
        `${reqMethod} ${routeName}`,
        {
          kind: SpanKind.SERVER,
          root: true,
        },
        async (span) => {
          span.setAttribute("requestId", requestId);
          span.setAttribute(SemanticAttributes.HTTP_METHOD, reqMethod);
          span.setAttribute(
            SemanticAttributes.HTTP_TARGET,
            getRequestPath(req),
          );
          span.setAttribute(SemanticAttributes.HTTP_ROUTE, routeName);

          const originalResEnd = res.end;
          // @ts-expect-error - this is a hack to get around Vercel freezing lambda's
          res.end = async function (this: unknown, ...args: unknown[]) {
            span.setAttribute(
              SemanticAttributes.HTTP_STATUS_CODE,
              res.statusCode,
            );
            span.end();
            // console.log(
            //   `BEFORE flus spans in batch ${spanProcessor.finishedSpans.length}`,
            // );
            await spanProcessor.forceFlush();
            // await sdk.shutdown();

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
            await spanProcessor.forceFlush();
            // await sdk.shutdown();

            // Throw original error
            throw e;
          }
        },
      );
    },
  });
};
