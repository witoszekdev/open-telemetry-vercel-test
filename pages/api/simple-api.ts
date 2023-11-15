import { NextApiRequest, NextApiResponse } from "next";
import { withOtel } from "../../otel-wrapper";

export default withOtel(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const content = req.body;
  await fetch("https://google.com");
  res.status(200).json({ ok: true, content });
}, "/api/simple-api");
