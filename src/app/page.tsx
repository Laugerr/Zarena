"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode, isValidRoomCode } from "@/lib/room-code";
import { generateName } from "@/lib/names";

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState(() => generateName());
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState("");

  function handleCreate() {
    if (!playerName.trim()) {
      setError("Pick a name first!");
      return;
    }
    const code = generateRoomCode();
    router.push(`/room/${code}?name=${encodeURIComponent(playerName.trim())}`);
  }

  function handleJoin() {
    if (!playerName.trim()) {
      setError("Pick a name first!");
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
    <main className="flex flex-1 flex-col items-center justify-center gap-10 p-4">
      {/* Logo */}
      <div className="text-center">
        <h1 className="bg-gradient-fun bg-clip-text text-6xl font-black tracking-tight text-transparent">
          Zarena
        </h1>
        <p className="mt-3 text-lg text-foreground/50">
          🎨 Draw, guess &amp; vibe with friends
        </p>
      </div>

      {/* Name Input */}
      <div className="flex flex-col items-center gap-3">
        <label className="text-sm font-medium text-foreground/60">
          👤 Your name
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
            className="w-56 rounded-xl border-2 border-surface-light bg-surface px-4 py-3 text-center text-lg font-semibold text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none"
            placeholder="Enter name..."
          />
          <button
            onClick={rollName}
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-surface-light bg-surface text-xl transition-all hover:border-accent hover:scale-110"
            title="Random name"
          >
            🎲
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleCreate}
          className="glow-accent w-72 rounded-xl bg-gradient-fun px-6 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:brightness-110"
        >
          🚀 Create Room
        </button>

        {!showJoinInput ? (
          <button
            onClick={() => setShowJoinInput(true)}
            className="w-72 rounded-xl border-2 border-surface-light bg-surface px-6 py-4 text-lg font-bold transition-all hover:border-accent hover:scale-105"
          >
            🔗 Join Room
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
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
              className="w-72 rounded-xl border-2 border-surface-light bg-surface px-4 py-4 text-center text-xl font-mono font-bold uppercase tracking-[0.3em] text-foreground placeholder:text-foreground/20 focus:border-accent focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleJoin}
              className="glow-success w-72 rounded-xl bg-success px-6 py-4 text-lg font-bold text-background transition-all hover:scale-105 hover:brightness-110"
            >
              ✨ Join
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </main>
  );
}
