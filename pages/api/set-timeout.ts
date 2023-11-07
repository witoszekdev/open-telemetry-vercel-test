import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "nodejs";

function wait(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.time();
  const id = setTimeout(() => {
    console.log("hello from timeout");
    console.timeLog("request start");
    fetch("https://webhook.site/bc9aaa76-cf2b-42d0-b8ab-9954e22ddbea");
    console.timeEnd();
  }, 4_000);
  console.timeLog("before wait");
  wait();
  console.timeLog("before response");
  res.status(200).json({ ok: true });
  console.timeLog("after response");
  // clearTimeout(id);
}
