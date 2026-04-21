"use client";

import { useEffect, useRef, useState } from "react";

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
      {/* Messages are absolute positioned to prevent height expansion. */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="absolute inset-0 space-y-1.5 overflow-y-auto overscroll-contain px-4 py-2 text-sm"
        >
          {entries.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-2xl opacity-20">💬</span>
              <p className="mt-1 text-xs text-foreground/15">No messages yet</p>
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
                <p className="rounded-xl bg-success/10 px-3 py-1.5 text-xs font-bold text-success">
                  🎉 {entry.playerName} got it!
                </p>
              )}
              {entry.type === "system" && (
                <p className="text-[11px] italic text-foreground/25">
                  {entry.text}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input is always pinned at bottom. */}
      <form
        onSubmit={handleSubmit}
        className="grid shrink-0 grid-cols-[minmax(0,1fr)_2.75rem] gap-2 border-t border-surface-lighter/30 p-2 pt-2 sm:p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "..." : placeholder}
          className="min-w-0 rounded-xl border border-surface-lighter bg-surface-light px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/20 transition-colors focus:border-accent focus:outline-none disabled:opacity-30 sm:px-4"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-black text-white transition-all hover:bg-accent-light active:scale-90 disabled:opacity-20 disabled:hover:bg-accent"
        >
          &gt;
        </button>
      </form>
    </div>
  );
}

export type { ChatEntry };
