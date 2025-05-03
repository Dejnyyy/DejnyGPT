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

  // ── DELETE ──────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    // delete all messages for this chat
    await prisma.message.deleteMany({ where: { chatId } });
    // delete the chat itself
    await prisma.chat.delete({ where: { id: chatId } });
    return res.status(200).json({ success: true });
  }

  // ── GET = load history ─────────────────────────────────────────────────
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

  // ── POST = append user + GPT reply ──────────────────────────────────────
  if (req.method === "POST") {
    const { message, imageUrl } = req.body as {
      message?: string;
      imageUrl?: string;
    };

    // ensure chat exists
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

    // save assistant reply
    await prisma.message.create({
      data: { chatId: chat.id, role: "assistant", content: reply },
    });

    return res.status(200).json({ chatId: chat.id, reply });
  }

  // unsupported
  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end();
}
