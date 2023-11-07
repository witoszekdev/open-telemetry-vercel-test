import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "nodejs";

const wait = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 2_000);
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.time("timer");
  const id = setTimeout(() => {
    console.log("hello from timeout");
    console.timeLog("timer", "request start");
    fetch("https://webhook.site/bc9aaa76-cf2b-42d0-b8ab-9954e22ddbea");
    console.timeEnd("timer");
  }, 4_000);
  console.timeLog("timer", "before response");
  wait();
  res.status(200).json({ ok: true });
  console.timeLog("timer", "after response");
  // clearTimeout(id);
}
