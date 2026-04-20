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
    <div className="flex h-full flex-col rounded-2xl">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1.5 text-sm"
      >
        {entries.length === 0 && (
          <p className="text-center text-foreground/20 text-xs pt-4">
            No messages yet...
          </p>
        )}
        {entries.map((entry) => (
          <div key={entry.id}>
            {entry.type === "guess" && (
              <p className="text-foreground/80">
                <span className="font-bold text-accent-light">
                  {entry.playerName}:
                </span>{" "}
                {entry.text}
              </p>
            )}
            {entry.type === "correct" && (
              <p className="font-bold text-success">
                🎉 {entry.playerName} guessed it!
              </p>
            )}
            {entry.type === "system" && (
              <p className="text-foreground/40 italic text-xs">
                {entry.text}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-surface-light p-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "Can't type right now" : placeholder}
          className="w-full rounded-xl border border-surface-light bg-surface-light px-3 py-2 text-sm text-foreground placeholder:text-foreground/25 focus:border-accent focus:outline-none disabled:opacity-40"
        />
      </form>
    </div>
  );
}

export type { ChatEntry };
