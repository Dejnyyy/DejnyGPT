// components/Sidebar.tsx
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  chats: { id: string; preview: string; createdAt: string }[];
  chatId: string | null;
  setChatId: (id: string | null) => void;
  deleteChat: (id: string) => void;
  createNewChat: () => void;
  cls: (light: string, dark: string) => string;
};

export default function Sidebar({ chats, chatId, setChatId, deleteChat, createNewChat, cls }: Props) {
  return (
    <aside className={`w-60 border-r flex flex-col ${cls("bg-white border-gray-200", "bg-gray-800 border-gray-700")}`}>
      <div className={`p-4 border-b flex items-center justify-between ${cls("border-gray-200", "border-gray-700")}`}>
        <h1 className={`text-lg font-semibold ${cls("text-gray-600", "text-gray-200")}`}>DejnyGPT</h1>
        <button onClick={createNewChat} className={`${cls("hover:bg-gray-100", "hover:bg-gray-700")} p-1 rounded-full`}>
          <PlusIcon className={cls("h-5 w-5 text-gray-600", "h-5 w-5 text-gray-300")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1">
        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => setChatId(c.id)}
            className={`flex items-center justify-between p-2 border-b truncate cursor-pointer ${cls(
              "border-gray-200 hover:bg-gray-100 text-gray-600",
              "border-gray-700 hover:bg-gray-700 text-gray-200"
            )} ${chatId === c.id ? cls("bg-gray-200", "bg-gray-700") : ""}`}
          >
            <span className="flex-1 truncate">{c.preview}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(c.id);
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-700 text-red-500 hover:text-white"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
