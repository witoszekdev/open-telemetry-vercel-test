import { trace } from "@opentelemetry/api";
import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "nodejs";

function wait(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return await trace
    .getTracer("example-nextjs-app")
    .startActiveSpan("set-timeout-route", async (span) => {
      const content = req.body;
      const requestId =
        (req.headers["x-vercel-proxy-signature-ts"] as string) ??
        "<unknown-request-id>";

      span.setAttribute("content", content);
      span.setAttribute("requestId", requestId);

      console.log("handling request", content, requestId);
      console.time(requestId);
      const handle = setTimeout(async () => {
        await trace
          .getTracer("example-nextjs-app")
          .startActiveSpan("timeout", async (timeoutSpan) => {
            const timeoutId = handle[Symbol.toPrimitive]();
            timeoutSpan.setAttribute("timeoutId", timeoutId);
            timeoutSpan.setAttribute("content", content);
            timeoutSpan.setAttribute("requestId", requestId);
            console.log("hello from timeout", {
              timeoutId,
              content,
              requestId,
            });
            console.time(`timeout-${timeoutId}`);
            try {
              await fetch(
                "https://webhook.site/bc9aaa76-cf2b-42d0-b8ab-9954e22ddbea",
                {
                  body: JSON.stringify({ requestId, content, timeoutId }),
                  method: "POST",
                },
              );
            } catch (e) {
              console.error("error in timeout", e);
            }
            console.timeEnd(`timeout-${timeoutId}`);
          });
      }, 4_000);
      console.timeLog(requestId, "before wait");
      await wait();
      console.timeLog(requestId, "before response");
      res.status(200).json({ ok: true, content });
      console.timeLog(requestId, "after response");
      span.end();
      // clearTimeout(id);
    });
}
