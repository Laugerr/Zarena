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
    <div className="rounded-lg border border-foreground/10 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground/60">🏆 Scores</h3>
      <ul className="flex flex-col gap-1.5">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className={`flex items-center justify-between rounded px-3 py-1.5 text-sm ${
              p.id === myId ? "bg-blue-500/10" : "bg-foreground/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-foreground/40">{i + 1}.</span>
              <span className="font-medium">{p.name}</span>
              {p.id === currentDrawer && (
                <span className="text-xs">🎨</span>
              )}
              {p.hasGuessedCorrectly && p.id !== currentDrawer && (
                <span className="text-xs">✅</span>
              )}
            </div>
            <span className="font-mono text-xs">{p.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
