// components/ChatInput.tsx
import { PaperAirplaneIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function ChatInput({
  input,
  setInput,
  send,
  fileInputRef,
  sendImage,
  cls,
}: {
  input: string;
  setInput: (v: string) => void;
  send: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  sendImage: () => void;
  cls: (light: string, dark: string) => string;
}) {
  return (
    <div className={`p-4 flex items-center gap-2 ${cls("bg-white border-t border-gray-200", "bg-gray-800 border-gray-700")}`}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={sendImage} />
      <button onClick={() => fileInputRef.current?.click()} className={`${cls("hover:bg-gray-100", "hover:bg-gray-700")} p-2 rounded-full`}>
        <PhotoIcon className={cls("h-6 w-6 text-gray-600", "h-6 w-6 text-gray-300")} />
      </button>
      <textarea
        className={`flex-1 resize-none px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${cls(
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
      <button onClick={send} className={`p-2 ${cls("bg-gray-300 hover:bg-black text-black hover:text-white","bg-black hover:bg-white text-white hover:text-black")} rounded-lg transition`}>
        <PaperAirplaneIcon className="h-5 w-5 rotate" />
      </button>
    </div>
  );
}
