import { NextApiRequest, NextApiResponse } from "next";
import { spanProcessor } from "../../utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const content = req.body;
  await fetch("https://google.com");
  await spanProcessor.forceFlush();
  res.status(200).json({ ok: true, content });
}
