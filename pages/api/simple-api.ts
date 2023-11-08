import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const content = req.body;
  await fetch("https://google.com");
  res.status(200).json({ ok: true, content });
}
