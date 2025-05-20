// components/ChatMessages.tsx
import TypingIndicator from "./TypingIndicator";

export default function ChatMessages({
  messages,
  isTyping,
  scrollRef,
  cls,
}: {
  messages: { role: string; content: string; isImage?: boolean }[];
  isTyping: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  cls: (light: string, dark: string) => string;
}) {
  return (
    <main ref={scrollRef} className={`flex-1 flex flex-col overflow-y-auto p-6 gap-4 ${cls("bg-gray-50", "bg-gray-900")}`}>
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
            <img src={m.content} alt="upload" className="rounded-lg max-w-full" />
          ) : (
            m.content
          )}
        </div>
      ))}
      {isTyping && <TypingIndicator cls={cls} />}
    </main>
  );
}
