"use client";

type WordPickerProps = {
  words: string[];
  onPick: (word: string) => void;
  timeLeft: number;
};

export default function WordPicker({ words, onPick, timeLeft }: WordPickerProps) {
  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-dots">
      <div className="animate-slide-up text-center">
        <div className="animate-float text-5xl mb-4">✏️</div>
        <h2 className="text-3xl font-black">Pick your word!</h2>
        <p className="mt-2 text-foreground/40 text-sm">What do you want to draw?</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 stagger">
        {words.map((word) => (
          <button
            key={word}
            onClick={() => onPick(word)}
            className="animate-slide-up glass rounded-2xl px-8 py-5 text-xl font-black transition-all hover:scale-110 hover:glow-purple hover:border-accent active:scale-95 card-hover"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
          timeLeft <= 5 ? "bg-danger/20 animate-pulse-urgent" : "bg-warning/20"
        }`}>
          <span className={`text-2xl font-black ${
            timeLeft <= 5 ? "text-danger" : "text-warning"
          }`}>
            {timeLeft}
          </span>
        </div>
        <span className="text-sm text-foreground/30">seconds to pick</span>
      </div>
    </div>
  );
}
