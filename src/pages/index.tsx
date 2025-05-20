// src/pages/index.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { marked } from "marked";

type Msg = {
  role: "user" | "assistant";
  content: string;
  isImage?: boolean;
};
type ChatItem = { id: string; preview: string; createdAt: string };

export default function Home({
  theme,
  setTheme,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline light/dark class helper
  const cls = (light: string, dark: string) =>
    theme === "dark" ? dark : light;

  // Fetch existing chats
  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data: ChatItem[]) => setChats(data));
  }, []);

  // Load messages when chatId changes
  useEffect(() => {
    if (!chatId) return;
    fetch(`/api/chat/${chatId}`)
      .then((r) => r.json())
      .then((data: { messages: Msg[] }) => {
        setMessages(data.messages);
      });
  }, [chatId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
    });
  }, [messages]);

  // Convert File → data URL
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function sendImage() {
    const inputEl = fileInputRef.current;
    if (!inputEl?.files?.[0]) return;
    const file = inputEl.files[0];
  
    // Upload to /api/upload
    const form = new FormData();
    form.append("image", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
    const { url: imageUrl } = await uploadRes.json();
  
    // Show image locally
    setMessages((m) => [
      ...m,
      { role: "user", content: imageUrl, isImage: true },
    ]);
  
    // Ensure chat exists
    let id = chatId;
   // if chat doesn't exist, create one
    if (!id) {
      const { chatId: newId } = await fetch("/api/chat", {
        method: "POST",
      }).then(r => r.json());
      id = newId;
      setChatId(id);

      const updated = await fetch("/api/chat").then(r => r.json());
      setChats(updated);
    }

  
    // Send image URL to GPT endpoint
    setIsTyping(true);
    const { reply } = await fetch(`/api/chat/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    }).then((r) => r.json());
    setIsTyping(false);
  
    // ✅ Define htmlReply AFTER getting reply
    const htmlReply = await marked(reply);
  
    // Show GPT response
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: htmlReply,
        isImage: reply.startsWith("http") && /\.(png|jpe?g|gif)$/.test(reply),
      },
    ]);
  
    inputEl.value = "";
  }
  

  async function deleteChat(id: string) {
    // Optimistically remove from UI
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (chatId === id) {
      setChatId(null);
      setMessages([]);
    }
    // Call API
    await fetch(`/api/chat/${id}`, { method: "DELETE" });
  }

  // Create a new chat
  async function createNewChat() {
    const { chatId: newId } = await fetch("/api/chat", {
      method: "POST",
    }).then((r) => r.json());
    setChatId(newId);
    setMessages([]);
    const updated = await fetch("/api/chat").then((r) => r.json());
    setChats(updated);
  }
  async function send() {
    if (!input.trim()) return;
  
    // Show user message instantly
    setMessages((m) => [...m, { role: "user", content: input }]);
  
    // Ensure chat exists
    let id = chatId;
    if (!id) {
      const { chatId: newId } = await fetch("/api/chat", {
        method: "POST",
      }).then((r) => r.json());
      id = newId;
      setChatId(id);
      const updated = await fetch("/api/chat").then((r) => r.json());
      setChats(updated);
    }
  
    setIsTyping(true);
  
    // ✅ Fetch assistant reply
    const { reply } = await fetch(`/api/chat/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    }).then((r) => r.json());
  
    setIsTyping(false);
  
    // ✅ Now use `marked()` AFTER you have the reply
    const htmlReply = await marked(reply);
  
    // Add assistant response
    setMessages((m) => [...m, { role: "assistant", content: htmlReply }]);
  
    setInput(""); // Clear input
  }
  

  return (
    <div className={`flex h-screen ${cls("bg-gray-50", "bg-gray-900")}`}>
      {/* Sidebar */}
      <aside
        className={`w-60 border-r flex flex-col ${cls(
          "bg-white border-gray-200",
          "bg-gray-800 border-gray-700"
        )}`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between ${cls(
            "border-gray-200",
            "border-gray-700"
          )}`}
        >
          <h1 className={`text-lg font-semibold ${cls( "text-gray-600","text-gray-200")}`}>DejnyGPT</h1>
          <button
            onClick={createNewChat}
            className={`${cls("hover:bg-gray-100", "hover:bg-gray-700")} p-1 rounded-full`}
          >
            <PlusIcon
              className={cls("h-5 w-5 text-gray-600", "h-5 w-5 text-gray-300")}
            />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1">
          {chats.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between p-2 border-b truncate cursor-pointer ${cls(
                "border-gray-200 hover:bg-gray-100 text-gray-600",
                "border-gray-700 hover:bg-gray-700 text-gray-200"
              )} ${
                chatId === c.id ? cls("bg-gray-200", "bg-gray-700") : ""
              }`}
              onClick={() => setChatId(c.id)}
            >
              <span className="flex-1 truncate">{c.preview}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(c.id);
                }}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-700 text-red-500 hover:text-white"
              >
                <TrashIcon className="h-4 w-4 " />
              </button>
            </div>
          ))}
       </nav>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className={`p-4 flex items-center justify-between ${cls(
            "bg-white border-b border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          <h2 className={`text-lg font-medium ${cls("text-gray-600","text-gray-200")}`}>
            {chatId ? `Chat ${chatId.slice(0, 8)}` : "New Chat"}
          </h2>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={`${cls("hover:bg-gray-100", "hover:bg-gray-700")} p-2 rounded-full`}
          >
            {theme === "light" ? (
              <MoonIcon className="h-6 w-6 text-gray-600" />
            ) : (
              <SunIcon className="h-6 w-6 text-yellow-400" />
            )}
          </button>
        </header>

        {/* Messages */}
        <main
          ref={scrollRef}
          className={`flex-1 flex flex-col overflow-y-auto p-6 gap-4 ${cls(
            "bg-gray-50",
            "bg-gray-900"
          )}`}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-3xl break-words max-w-[60%] ${
                m.role === "user"
                  ? "self-end bg-blue-600 text-white"
                  : "self-start bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {m.isImage ? (
                <img
                  src={m.content}
                  alt="upload"
                  className="rounded-lg max-w-full"
                />
              ) : (
                <div
                className="whitespace-pre-line prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: m.content }}
              />
              )}
            </div>
          ))}

          {/* typing indicator */}
          {isTyping && (
            <div
              className={`px-4 py-2 rounded-3xl max-w-[60%] self-start ${cls(
                "bg-gray-200 text-gray-900",
                "bg-gray-700 text-gray-200"
              )}`}
            >
              <div className="flex items-center space-x-1 h-4">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className={`${cls("bg-gray-600", "bg-gray-300")} w-2 h-2 rounded-full animate-bounce`}
                    style={{
                      animationDelay: `${delay}ms`,
                      animationIterationCount: "infinite",
                      animationDuration: "0.8s",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Input bar */}
        <div
          className={`p-4 flex items-center gap-2 ${cls(
            "bg-white border-t border-gray-200",
            "bg-gray-800 border-gray-700"
          )}`}
        >
          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={sendImage}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${cls("hover:bg-gray-100", "hover:bg-gray-700")} p-2 rounded-full`}
          >
            <PhotoIcon
              className={cls("h-6 w-6 text-gray-600", "h-6 w-6 text-gray-300")}
            />
          </button>

          {/* Text input */}
          <textarea
            className={`flex-1 resize-none px-3 py-2 border rounded-md focus:outline-none focus:ring-2  ${cls(
              "border-gray-300 bg-white text-black focus:ring-black",
              "border-gray-600 bg-gray-700 text-white focus:ring-white"
            )}`}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          {/* Send text */}
          <button
          disabled={isTyping === true}
          onClick={send}
          className={cls(
            "p-2 rounded-lg transition",
            isTyping === true
              ? "bg-gray-300 text-black cursor-not-allowed"
              : "bg-black hover:bg-white text-white hover:text-black"
          )}
        >
          <PaperAirplaneIcon className="h-5 w-5 rotate" />
        </button>

        </div>
      </div>
    </div>
  );
}