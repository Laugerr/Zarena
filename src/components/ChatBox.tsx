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
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onGuess(text);
    setInput("");
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Messages — absolute positioned to prevent height expansion */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto overscroll-contain px-4 py-2 space-y-1.5 text-sm"
        >
          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-2xl opacity-20">💬</span>
              <p className="text-foreground/15 text-xs mt-1">No messages yet</p>
            </div>
          )}
          {entries.map((entry) => (
            <div key={entry.id}>
              {entry.type === "guess" && (
                <p className="text-foreground/70">
                  <span className="font-bold text-accent-light">
                    {entry.playerName}
                  </span>{" "}
                  <span className="text-foreground/50">{entry.text}</span>
                </p>
              )}
              {entry.type === "correct" && (
                <p className="rounded-xl bg-success/10 px-3 py-1.5 font-bold text-success text-xs">
                  🎉 {entry.playerName} got it!
                </p>
              )}
              {entry.type === "system" && (
                <p className="text-[11px] text-foreground/25 italic">
                  {entry.text}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input — always pinned at bottom */}
      <form onSubmit={handleSubmit} className="shrink-0 p-3 pt-2 border-t border-surface-lighter/30">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "..." : placeholder}
          className="w-full rounded-xl border border-surface-lighter bg-surface-light px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/20 focus:border-accent focus:outline-none disabled:opacity-30 transition-colors"
        />
      </form>
    </div>
  );
}

export type { ChatEntry };
