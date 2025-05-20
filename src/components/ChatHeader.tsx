// components/ChatHeader.tsx
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ChatHeader({
  theme,
  setTheme,
  chatId,
  cls,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  chatId: string | null;
  cls: (light: string, dark: string) => string;
}) {
  return (
    <header className={`p-4 flex items-center justify-between ${cls("bg-white border-b border-gray-200", "bg-gray-800 border-gray-700")}`}>
      <h2 className={`text-lg font-medium ${cls("text-gray-600", "text-gray-200")}`}>
        {chatId ? `Chat ${chatId.slice(0, 8)}` : "New Chat"}
      </h2>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className={`${cls("hover:bg-gray-100", "hover:bg-gray-700")} p-2 rounded-full`}>
        {theme === "light" ? <MoonIcon className="h-6 w-6 text-gray-600" /> : <SunIcon className="h-6 w-6 text-yellow-400" />}
      </button>
    </header>
  );
}
