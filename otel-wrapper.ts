import { trace, type Span } from "@opentelemetry/api";
import { NextApiRequest, NextApiResponse } from "next";
import { sdk } from "./my-instrumentation";

export type NextOtelApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  span: Span,
) => unknown | Promise<unknown>;

export const withOtel = async (handler: NextOtelApiHandler, name?: string) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    sdk.start();
    const requestId =
      (req.headers["x-vercel-proxy-signature-ts"] as string) ??
      "<unknown-request-id>";
    console.time(requestId);
    console.timeLog(requestId, "withOtel wrapper");

    const result = trace
      .getTracer("example-otel-app")
      .startActiveSpan(name ?? handler.name, async (span) => {
        span.setAttribute("requestId", requestId);

        const apiResult = await handler(req, res, span);
        span.end();

        return apiResult;
      });
    sdk.shutdown();
    return result;
  };
};
