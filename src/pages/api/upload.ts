// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files, File as FormidableFile } from "formidable";
import fs from "fs";
import { join } from "path";

export const config = {
  api: {
    bodyParser: false, // we’re using formidable
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1️⃣ Ensure upload directory exists
  const uploadDir = join(process.cwd(), "public", "uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // 2️⃣ Configure formidable
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
  });

  // 3️⃣ Parse the incoming request
  form.parse(
    req,
    (err: any, fields: Fields, files: Files) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Our <input name="image" />, so files.image should exist
      if (!files.image) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // files.image can be File or File[]
      const fileObj = Array.isArray(files.image)
        ? (files.image[0] as FormidableFile)
        : (files.image as FormidableFile);

      // Newer formidable v2 uses fileObj.filepath
      const filepath = fileObj.filepath;
      const filename = filepath.split("/uploads/").pop();

      if (!filename) {
        return res.status(500).json({ error: "Could not determine filename" });
      }

      // Build a public URL (set NEXT_PUBLIC_BASE_URL in .env, e.g. http://localhost:3000)
      const base = process.env.NEXT_PUBLIC_BASE_URL || "";
      const url = `${base}/uploads/${filename}`;

      return res.status(200).json({ url });
    }
  );
}
