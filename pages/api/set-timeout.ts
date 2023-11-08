import { trace } from "@opentelemetry/api";
import { NextApiRequest, NextApiResponse } from "next";
import { createSdk, spanProcessor } from "../../my-instrumentation";

export const runtime = "nodejs";

function wait(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const sdk = createSdk();
  const span = trace.getTracer("something-else").startSpan("set-timeout-route");
  const content = req.body;
  const requestId =
    (req.headers["x-vercel-proxy-signature-ts"] as string) ??
    "<unknown-request-id>";

  span.setAttribute("content", content);
  span.setAttribute("requestId", requestId);

  console.log("handling request", content, requestId);
  console.time(requestId);
  console.timeLog(requestId, "before wait");
  await wait();
  console.timeLog(requestId, "before response");
  span.end();
  await sdk.shutdown();
  res.status(200).json({ ok: true, content });
  console.timeLog(requestId, "after response");
}
