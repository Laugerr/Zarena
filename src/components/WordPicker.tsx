"use client";

import { getWordCategory } from "@/lib/words";

type WordPickerProps = {
  words: string[];
  onPick: (word: string) => void;
  timeLeft: number;
};

export default function WordPicker({ words, onPick, timeLeft }: WordPickerProps) {
  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 p-4 sm:p-8 bg-dots">
      <div className="animate-slide-up text-center">
        <div className="animate-float text-4xl sm:text-5xl mb-3 sm:mb-4">✏️</div>
        <h2 className="text-2xl sm:text-3xl font-black">Pick your word!</h2>
        <p className="mt-2 text-foreground/40 text-xs sm:text-sm">What do you want to draw?</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-5 stagger w-full max-w-lg">
        {words.map((word) => {
          const category = getWordCategory(word);
          const blanks = word.split("").map((ch) => (ch === " " ? " " : "_")).join(" ");
          return (
            <button
              key={word}
              onClick={() => onPick(word)}
              className="animate-slide-up glass rounded-2xl px-5 py-4 sm:px-8 sm:py-5 flex flex-col items-center gap-1.5 transition-all hover:scale-110 hover:glow-purple hover:border-accent active:scale-95 card-hover min-w-[120px]"
            >
              <span className="text-base sm:text-xl font-black truncate max-w-full">{word}</span>
              <span className="font-mono text-[10px] sm:text-xs tracking-widest text-foreground/30">{blanks}</span>
              {category && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-accent-light/70 uppercase tracking-wide">
                  {category.replace(/^[^ ]+ /, "")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full ${
          timeLeft <= 5 ? "bg-danger/20 animate-pulse-urgent" : "bg-warning/20"
        }`}>
          <span className={`text-xl sm:text-2xl font-black ${timeLeft <= 5 ? "text-danger" : "text-warning"}`}>
            {timeLeft}
          </span>
        </div>
        <span className="text-xs sm:text-sm text-foreground/30">seconds to pick</span>
      </div>
    </div>
  );
}
