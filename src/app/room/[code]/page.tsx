"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import { generateName } from "@/lib/names";
import type { ClientMessage, Player, ServerMessage } from "@/lib/types";

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const name = useMemo(() => generateName(), []);
  const hasSentJoin = useRef(false);

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999",
    room: code,
    onMessage(event) {
      const msg = JSON.parse(event.data) as ServerMessage;

      switch (msg.type) {
        case "sync":
          setPlayers(msg.players);
          break;
        case "player-joined":
          setPlayers((prev) => [...prev, msg.player]);
          break;
        case "player-left":
          setPlayers((prev) => prev.filter((p) => p.id !== msg.id));
          break;
      }
    },
  });

  useEffect(() => {
    if (socket && !hasSentJoin.current) {
      const joinMsg: ClientMessage = { type: "join", name: name };
      socket.send(JSON.stringify(joinMsg));
      hasSentJoin.current = true;
    }
  }, [socket]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">
          Room <span className="font-mono tracking-wider">{code}</span>
        </h1>
        <p className="text-foreground/60">
          Connected as{" "}
          <span className="font-semibold">{name}</span>
        </p>
      </div>

      <div className="rounded-lg border border-foreground/10 p-6 text-center">
        <p className="text-lg">
          <span className="text-3xl font-bold">{players.length}</span>{" "}
          {players.length === 1 ? "player" : "players"} in room
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {players.map((p) => (
            <li
              key={p.id}
              className="rounded-full bg-foreground/10 px-3 py-1 text-sm font-medium"
            >
              {p.name}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
