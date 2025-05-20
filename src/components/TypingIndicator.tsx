// components/TypingIndicator.tsx
export default function TypingIndicator({ cls }: { cls: (light: string, dark: string) => string }) {
    return (
      <div className={`px-4 py-2 rounded-3xl max-w-[60%] self-start ${cls("bg-gray-200 text-gray-900", "bg-gray-700 text-gray-200")}`}>
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
    );
  }
  