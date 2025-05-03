// src/pages/api/image.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | { error: string }>
) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body as { prompt: string };

  const imgRes = await openai.images.generate({
    prompt,
    size: "512x512",
    n: 1,
  });

  const url = imgRes.data?.[0]?.url;
  if (!url) return res.status(500).json({ error: "No image returned" });

  res.status(200).json({ url });
}
