"use client";

import { useEffect, useRef, useState } from "react";

type ChatEntry = {
  id: string;
  type: "guess" | "correct" | "system" | "whisper";
  playerName?: string;
  text: string;
};

type ChatBoxProps = {
  entries: ChatEntry[];
  onGuess: (text: string) => void;
  disabled: boolean;
  isDrawer?: boolean;
  placeholder?: string;
};

export default function ChatBox({
  entries,
  onGuess,
  disabled,
  isDrawer = false,
  placeholder = "Type your guess...",
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
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
      {/* Messages */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="absolute inset-0 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-2 text-sm"
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
                <p className="text-sm leading-snug">
                  <span className="font-bold text-accent-light">{entry.playerName}</span>{" "}
                  <span className="text-foreground/50">{entry.text}</span>
                </p>
              )}
              {entry.type === "correct" && (
                <div className="rounded-xl bg-success/15 px-3 py-2 border border-success/20">
                  <p className="text-xs font-black text-success">
                    🎉 {entry.playerName} got it!
                  </p>
                </div>
              )}
              {entry.type === "system" && (
                <p className="text-[11px] italic text-foreground/25">{entry.text}</p>
              )}
              {entry.type === "whisper" && (
                <div className="rounded-xl bg-accent/10 border border-accent/20 px-2.5 py-1.5">
                  <p className="text-[11px] italic text-accent-light/70">
                    🔒 {entry.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-surface-lighter/30 p-2 sm:p-3"
      >
        {isDrawer ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-surface-lighter/40 bg-surface-light/50 px-3 py-3 text-xs text-foreground/30">
            <span className="text-base">🎨</span>
            <span className="font-medium">You&apos;re drawing — no guessing!</span>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_2.75rem] gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={disabled}
              placeholder={disabled ? "Waiting..." : placeholder}
              className="min-w-0 rounded-xl border border-surface-lighter bg-surface-light px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-30 sm:px-4"
            />
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              aria-label="Send guess"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-black text-white transition-all hover:bg-accent-light active:scale-90 disabled:opacity-20 disabled:hover:bg-accent"
            >
              ›
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export type { ChatEntry };
