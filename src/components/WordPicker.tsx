"use client";

type WordPickerProps = {
  words: string[];
  onPick: (word: string) => void;
};

export default function WordPicker({ words, onPick }: WordPickerProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-xl font-bold">✏️ Choose a word to draw</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {words.map((word) => (
          <button
            key={word}
            onClick={() => onPick(word)}
            className="rounded-lg border border-foreground/20 px-6 py-3 text-lg font-medium transition-colors hover:border-blue-500 hover:bg-blue-500/10"
          >
            {word}
          </button>
        ))}
      </div>
      <p className="text-sm text-foreground/50">
        ⏳ Hurry! A word will be auto-selected if you don&apos;t pick in time.
      </p>
    </div>
  );
}
