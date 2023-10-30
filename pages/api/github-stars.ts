import { NextApiRequest, NextApiResponse } from "next";

export const runtime = "nodejs";

async function fetchGithubStars() {
  const res = await fetch("https://api.github.com/repos/vercel/next.js", {
    next: {
      revalidate: 0,
    },
  });
  const data = await res.json();
  return data.stargazers_count;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const stars = await fetchGithubStars();
  res.status(200).json({ stars });
}
