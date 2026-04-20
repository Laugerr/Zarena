"use client";

import type { Player } from "@/lib/types";

type ScoreboardProps = {
  players: Player[];
  currentDrawer: string | null;
  myId: string;
};

const RANK_BADGES = ["🥇", "🥈", "🥉"];

export default function Scoreboard({ players, currentDrawer, myId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass rounded-3xl p-4 h-full">
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
        Scoreboard
      </h3>
      <ul className="flex flex-col gap-1.5">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
              p.id === myId
                ? "bg-accent/15 border border-accent/20"
                : "bg-surface-light/30"
            } ${p.id === currentDrawer ? "ring-1 ring-pink/30" : ""}`}
          >
            <span className="w-5 text-center">
              {i < 3 ? RANK_BADGES[i] : <span className="text-foreground/20">{i + 1}</span>}
            </span>
            <span className="flex-1 truncate font-semibold">{p.name}</span>
            {p.id === currentDrawer && (
              <span className="text-[10px]" title="Drawing">🎨</span>
            )}
            {p.hasGuessedCorrectly && p.id !== currentDrawer && (
              <span className="text-[10px]" title="Got it!">✅</span>
            )}
            <span className="font-mono text-[10px] font-black text-accent-light w-8 text-right">
              {p.score}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
