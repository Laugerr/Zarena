"use client";

import { useRef, useState, useEffect } from "react";

type ChatEntry = {
  id: string;
  type: "guess" | "correct" | "system";
  playerName?: string;
  text: string;
};

type ChatBoxProps = {
  entries: ChatEntry[];
  onGuess: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
};

export default function ChatBox({
  entries,
  onGuess,
  disabled,
  placeholder = "Type your guess...",
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onGuess(text);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-foreground/10">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 text-sm"
      >
        {entries.map((entry) => (
          <div key={entry.id}>
            {entry.type === "guess" && (
              <p>
                <span className="font-semibold">{entry.playerName}:</span>{" "}
                {entry.text}
              </p>
            )}
            {entry.type === "correct" && (
              <p className="font-semibold text-green-500">
                🎉 {entry.playerName} guessed it!
              </p>
            )}
            {entry.type === "system" && (
              <p className="text-foreground/50 italic">{entry.text}</p>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-foreground/10 p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "You can't guess right now" : placeholder}
          className="w-full rounded border border-foreground/20 bg-transparent px-3 py-2 text-sm placeholder:text-foreground/30 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
      </form>
    </div>
  );
}

export type { ChatEntry };
