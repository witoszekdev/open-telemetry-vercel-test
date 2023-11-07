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
    fetch("http://google.com");
  }, 1000);
  console.timeLog("timer");
  res.status(200).json({ ok: true, timeoutId: id });
}
