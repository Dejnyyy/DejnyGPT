// src/pages/api/chat/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // List all chats with the most recent message as a preview
    const chats = await prisma.chat.findMany({
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    return res.status(200).json(
      chats.map((c) => ({
        id: c.id,
        preview: c.messages[0]?.content ?? "New Chat",
        createdAt: c.createdAt,
      }))
    );
  }

  if (req.method === "POST") {
    // Create a fresh chat
    const chat = await prisma.chat.create({ data: {} });
    return res.status(200).json({ chatId: chat.id });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
