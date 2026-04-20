"use client";

type WordPickerProps = {
  words: string[];
  onPick: (word: string) => void;
  timeLeft: number;
};

export default function WordPicker({ words, onPick, timeLeft }: WordPickerProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-black">✏️ Pick a word!</h2>
        <p className="mt-2 text-foreground/50">Choose what you want to draw</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {words.map((word) => (
          <button
            key={word}
            onClick={() => onPick(word)}
            className="glow-accent rounded-2xl border-2 border-surface-light bg-surface px-8 py-4 text-xl font-bold transition-all hover:border-accent hover:scale-110 hover:bg-surface-light"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-foreground/40">
        <span className="text-2xl font-bold text-warning">{timeLeft}</span>
        <span className="text-sm">seconds to pick</span>
      </div>
    </div>
  );
}
