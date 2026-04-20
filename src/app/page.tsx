"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode, isValidRoomCode } from "@/lib/room-code";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState("");

  function handleCreate() {
    const code = generateRoomCode();
    router.push(`/room/${code}`);
  }

  function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) {
      setError("Enter a valid 6-character room code");
      return;
    }
    router.push(`/room/${code}`);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-4xl font-bold tracking-tight">Zarena</h1>
      <p className="text-foreground/60 text-lg">
        Party games with friends — no sign-up needed
      </p>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleCreate}
          className="w-64 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Create Room
        </button>

        {!showJoinInput ? (
          <button
            onClick={() => setShowJoinInput(true)}
            className="w-64 rounded-lg border border-foreground/20 px-6 py-3 text-lg font-semibold transition-colors hover:bg-foreground/5"
          >
            Join Room
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="BRAVO7"
              maxLength={6}
              className="w-64 rounded-lg border border-foreground/20 bg-transparent px-4 py-3 text-center text-lg font-mono uppercase tracking-widest placeholder:text-foreground/30 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleJoin}
              className="w-64 rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-700"
            >
              Join
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
