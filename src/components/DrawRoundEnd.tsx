"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Player, Stroke } from "@/lib/types";
import { getAvatar } from "@/lib/avatars";

type DrawRoundEndProps = {
  word: string;
  players: Player[];
  prevScores: Record<string, number>;
  myId: string;
  countdown: number;
  round: number;
  totalRounds: number;
  strokes: Stroke[];
};

function StrokeCanvas({ strokes }: { strokes: Stroke[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / 800;
    const scaleY = canvas.height / 600;

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size * Math.min(scaleX, scaleY);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
      for (let i = 1; i < stroke.points.length - 1; i++) {
        const mx = ((stroke.points[i].x + stroke.points[i + 1].x) / 2) * scaleX;
        const my = ((stroke.points[i].y + stroke.points[i + 1].y) / 2) * scaleY;
        ctx.quadraticCurveTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY, mx, my);
      }
      const last = stroke.points[stroke.points.length - 1];
      ctx.lineTo(last.x * scaleX, last.y * scaleY);
      ctx.stroke();
    }
  }, [strokes]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={240}
      className="w-full h-full rounded-2xl"
    />
  );
}

export default function DrawRoundEnd({
  word,
  players,
  prevScores,
  myId,
  countdown,
  round,
  totalRounds,
  strokes,
}: DrawRoundEndProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  // Previous rankings (by old scores)
  const prevRankMap: Record<string, number> = {};
  [...players]
    .map((p) => ({ id: p.id, score: prevScores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .forEach((p, i) => { prevRankMap[p.id] = i; });

  const isLastRound = round >= totalRounds;

  return (
    <main className="relative flex flex-1 min-h-0 flex-col items-center justify-center gap-4 sm:gap-6 p-4 bg-dots overflow-y-auto">
      {/* Home button */}
      <Link
        href="/"
        className="absolute top-3 left-3 rounded-xl bg-surface-light/70 border border-surface-lighter/40 px-3 py-1.5 text-xs font-bold text-foreground/40 hover:text-foreground/70 hover:bg-surface-lighter transition-all"
      >
        ← Home
      </Link>

      {/* Title */}
      <div className="text-center animate-slide-up pt-6 sm:pt-0">
        <div className="text-4xl sm:text-5xl mb-2 animate-wiggle">⏰</div>
        <h2 className="text-2xl sm:text-3xl font-black">Round {round} Over!</h2>
      </div>

      {/* Word reveal */}
      <div
        className="animate-slide-up flex flex-col items-center gap-1.5"
        style={{ animationDelay: "100ms" }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
          The word was
        </span>
        <span className="rounded-2xl bg-warning/20 border border-warning/30 px-6 py-3 text-3xl sm:text-4xl font-black text-warning glow-purple">
          {word}
        </span>
      </div>

      {/* Canvas preview */}
      {strokes.length > 0 && (
        <div
          className="animate-slide-up w-full max-w-xs sm:max-w-sm aspect-[4/3] glass rounded-2xl overflow-hidden border border-surface-lighter/40"
          style={{ animationDelay: "120ms" }}
        >
          <StrokeCanvas strokes={strokes} />
        </div>
      )}

      {/* Player results */}
      <div
        className="w-full max-w-sm flex flex-col gap-2 stagger"
        style={{ animationDelay: "150ms" }}
      >
        {sorted.map((p, newRank) => {
          const oldRank = prevRankMap[p.id] ?? newRank;
          const pointsGained = p.score - (prevScores[p.id] ?? 0);
          const rankChange = oldRank - newRank; // positive = moved up

          return (
            <div
              key={p.id}
              className={`animate-slide-up flex items-center gap-3 rounded-2xl px-4 py-3 ${
                p.id === myId
                  ? "glass border border-accent/30 bg-accent/10"
                  : "glass"
              }`}
            >
              {/* Medal / rank */}
              <span className="w-7 text-center text-lg shrink-0">
                {newRank === 0 ? "👑" : newRank === 1 ? "🥈" : newRank === 2 ? "🥉" : `${newRank + 1}.`}
              </span>

              {/* Avatar */}
              <span className="text-lg shrink-0">{getAvatar(p.id)}</span>

              {/* Name */}
              <span className="flex-1 font-bold truncate text-sm">{p.name}</span>

              {/* Points gained */}
              {pointsGained > 0 && (
                <span className="text-xs font-black text-success shrink-0 bg-success/10 rounded-lg px-2 py-0.5">
                  +{pointsGained}
                </span>
              )}

              {/* Rank movement */}
              {rankChange > 0 && (
                <span className="text-xs font-black text-lime shrink-0">↑{rankChange}</span>
              )}
              {rankChange < 0 && (
                <span className="text-xs font-bold text-danger/50 shrink-0">↓{Math.abs(rankChange)}</span>
              )}

              {/* Total score */}
              <span className="font-mono text-sm font-black text-accent-light w-10 text-right shrink-0">
                {p.score}
              </span>
            </div>
          );
        })}
      </div>

      {/* Countdown */}
      <div
        className="animate-slide-up flex items-center gap-3 glass rounded-2xl px-6 py-3"
        style={{ animationDelay: "300ms" }}
      >
        <span className="text-sm text-foreground/40">
          {isLastRound ? "Game ends in" : "Next round in"}
        </span>
        <span
          className={`text-2xl font-black ${
            countdown <= 3 ? "text-danger animate-pulse-urgent" : "text-warning"
          }`}
        >
          {countdown}
        </span>
      </div>
    </main>
  );
}
