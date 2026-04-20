"use client";

import type { Player } from "@/lib/types";

type ScoreboardProps = {
  players: Player[];
  currentDrawer: string | null;
  myId: string;
};

export default function Scoreboard({ players, currentDrawer, myId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="rounded-2xl border border-surface-light bg-surface p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/40">
        🏆 Scoreboard
      </h3>
      <ul className="flex flex-col gap-1.5">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
              p.id === myId
                ? "bg-accent/15 border border-accent/30"
                : "bg-surface-light"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
              </span>
              <span className="font-medium truncate max-w-[80px]">{p.name}</span>
              {p.id === currentDrawer && (
                <span className="text-xs" title="Drawing">🎨</span>
              )}
              {p.hasGuessedCorrectly && p.id !== currentDrawer && (
                <span className="text-xs" title="Guessed correctly">✅</span>
              )}
            </div>
            <span className="font-mono text-xs font-bold text-accent-light">
              {p.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
