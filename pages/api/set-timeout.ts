import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "nodejs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.time("timer");
  const id = setTimeout(() => {
    console.log("hello from timeout");
    console.timeEnd("timer");
    fetch("https://webhook.site/bc9aaa76-cf2b-42d0-b8ab-9954e22ddbea");
  }, 4_000);
  console.timeLog("timer", "before response");
  res.status(200).json({ ok: true });
  console.timeLog("timer", "after response");
  clearTimeout(id);
}
