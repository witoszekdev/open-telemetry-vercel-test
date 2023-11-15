import { trace } from "@opentelemetry/api";
import { withOtel } from "../../otel-wrapper";

export const runtime = "nodejs";

function wait(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default withOtel(async function setTimeout(req, res, span) {
  const content = req.body;
  const requestId =
    (req.headers["x-vercel-proxy-signature-ts"] as string) ??
    "<unknown-request-id>";

  span?.setAttribute("content", content);

  const childSpan = trace.getTracer("example-otel-app").startSpan(`setTimeout`);
  console.log("handling request", content, requestId);
  console.timeLog(requestId, "before wait");
  await wait();
  console.timeLog(requestId, "before response");
  childSpan.end();
  res.status(200).json({ ok: true, content });
  console.timeLog(requestId, "after response");
});
