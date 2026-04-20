"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode, isValidRoomCode } from "@/lib/room-code";
import { generateName } from "@/lib/names";

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState(() => generateName());
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"idle" | "join">("idle");
  const [error, setError] = useState("");

  function handleCreate() {
    if (!playerName.trim()) {
      setError("You need a name to play!");
      return;
    }
    const code = generateRoomCode();
    router.push(`/room/${code}?name=${encodeURIComponent(playerName.trim())}`);
  }

  function handleJoin() {
    if (!playerName.trim()) {
      setError("You need a name to play!");
      return;
    }
    const code = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) {
      setError("Enter a valid 6-character room code");
      return;
    }
    router.push(`/room/${code}?name=${encodeURIComponent(playerName.trim())}`);
  }

  function rollName() {
    setPlayerName(generateName());
  }

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-12 p-6 bg-dots overflow-hidden">
      {/* Floating decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute top-[15%] left-[10%] text-4xl opacity-20">🎨</div>
        <div className="animate-float-slow absolute top-[25%] right-[15%] text-3xl opacity-20">✏️</div>
        <div className="animate-float absolute bottom-[20%] left-[20%] text-3xl opacity-15">🎯</div>
        <div className="animate-float-slow absolute bottom-[30%] right-[10%] text-4xl opacity-15">🏆</div>
        <div className="animate-spin-slow absolute top-[10%] right-[30%] text-2xl opacity-10">⭐</div>
        <div className="animate-float absolute top-[60%] left-[8%] text-2xl opacity-10">🎭</div>
      </div>

      {/* Logo */}
      <div className="animate-slide-up text-center relative z-10">
        <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-7xl font-black tracking-tighter text-transparent sm:text-8xl">
          Zarena
        </h1>
        <p className="mt-4 text-lg text-foreground/50 font-medium">
          Draw, guess &amp; laugh with friends ✨
        </p>
      </div>

      {/* Name Card */}
      <div className="animate-slide-up glass rounded-3xl p-6 w-full max-w-sm relative z-10" style={{ animationDelay: "100ms" }}>
        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">
          Your identity
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError("");
            }}
            maxLength={16}
            className="flex-1 rounded-2xl border-2 border-surface-lighter bg-surface px-4 py-3.5 text-center text-lg font-bold text-foreground placeholder:text-foreground/20 focus:border-accent focus:outline-none transition-colors"
            placeholder="Enter name..."
          />
          <button
            onClick={rollName}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-2 border-surface-lighter bg-surface text-xl transition-all hover:border-accent hover:scale-110 hover:rotate-12 active:scale-95"
            title="Random name"
          >
            🎲
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="animate-slide-up flex flex-col items-center gap-4 w-full max-w-sm relative z-10" style={{ animationDelay: "200ms" }}>
        <button
          onClick={handleCreate}
          className="group glow-purple w-full rounded-2xl bg-gradient-main p-[2px] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-center gap-3 rounded-[14px] bg-surface/50 px-6 py-4 transition-all group-hover:bg-transparent">
            <span className="text-2xl">🚀</span>
            <span className="text-lg font-bold">Create Room</span>
          </div>
        </button>

        {mode === "idle" ? (
          <button
            onClick={() => setMode("join")}
            className="w-full rounded-2xl border-2 border-surface-lighter bg-surface px-6 py-4 text-lg font-bold transition-all hover:border-accent/50 hover:bg-surface-light card-hover"
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">🔗</span>
              Join Room
            </span>
          </button>
        ) : (
          <div className="w-full animate-slide-up flex flex-col gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="ROOM CODE"
              maxLength={6}
              className="w-full rounded-2xl border-2 border-surface-lighter bg-surface px-4 py-4 text-center text-2xl font-black font-mono uppercase tracking-[0.4em] text-foreground placeholder:text-foreground/15 focus:border-cyan focus:outline-none transition-colors"
              autoFocus
            />
            <button
              onClick={handleJoin}
              className="glow-cyan w-full rounded-2xl bg-gradient-cool px-6 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              ✨ Join Game
            </button>
            <button
              onClick={() => setMode("idle")}
              className="text-sm text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="animate-slide-up fixed bottom-6 rounded-2xl bg-danger/20 border border-danger/30 px-5 py-3 text-sm font-semibold text-danger backdrop-blur-sm">
          ⚠️ {error}
        </div>
      )}
    </main>
  );
}
