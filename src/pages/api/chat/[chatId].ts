// src/pages/api/chat/[chatId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chatId } = req.query as { chatId: string };

  // 1) GET = load history
  if (req.method === "GET") {
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json({
      messages: history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });
  }

  // 2) POST = append user + GPT reply (your existing code)
  if (req.method === "POST") {
    const { message, imageUrl } = req.body as {
        message?: string;
        imageUrl?: string;
      };
      

    // ensure chat
    let chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) chat = await prisma.chat.create({ data: {} });

    // save user message
    if (message) {
      await prisma.message.create({
        data: { chatId: chat.id, role: "user", content: message },
      });
    }

    // build history for OpenAI
    const history = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
    });
    const msgs: ChatCompletionCreateParams["messages"] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    msgs.push({
        role: "user",
        content: imageUrl ?? message ?? "",
      });
      
    // GPT‑4o call
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: msgs,
    });
    const reply = aiRes.choices[0].message.content ?? "";

    // save assistant
    await prisma.message.create({
      data: { chatId: chat.id, role: "assistant", content: reply },
    });

    return res.status(200).json({ chatId: chat.id, reply });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
