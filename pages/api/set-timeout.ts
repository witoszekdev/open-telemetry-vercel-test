import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "nodejs";

function wait(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const content = req.body;

  console.log("handling request", content, req.headers);
  console.time();
  const handle = setTimeout(() => {
    const timeoutId = handle[Symbol.toPrimitive]();
    console.log("hello from timeout", { timeoutId, content });
    console.time(`timeout-${timeoutId}`);
    fetch("https://webhook.site/bc9aaa76-cf2b-42d0-b8ab-9954e22ddbea");
    console.timeEnd(`timeout-${timeoutId}`);
  }, 4_000);
  console.timeLog();
  await wait();
  console.timeLog();
  res.status(200).json({ ok: true, content });
  console.timeLog();
  // clearTimeout(id);
}
