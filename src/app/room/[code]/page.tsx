"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import { generateName } from "@/lib/names";
import { DEFAULT_SETTINGS } from "@/lib/types";
import type {
  ClientMessage,
  GameState,
  Player,
  RoomSettings,
  ServerMessage,
  Stroke,
} from "@/lib/types";
import Lobby from "@/components/Lobby";
import Canvas from "@/components/Canvas";
import ChatBox, { type ChatEntry } from "@/components/ChatBox";
import WordPicker from "@/components/WordPicker";
import Scoreboard from "@/components/Scoreboard";

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const name = useMemo(
    () => searchParams.get("name") || generateName(),
    [searchParams]
  );
  const hasSentJoin = useRef(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_SETTINGS);
  const [hostId, setHostId] = useState("");
  const [game, setGame] = useState<GameState | null>(null);
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [chatEntries, setChatEntries] = useState<ChatEntry[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [revealedWord, setRevealedWord] = useState<string | null>(null);

  const chatIdCounter = useRef(0);

  const addChatEntry = useCallback(
    (entry: Omit<ChatEntry, "id">) => {
      chatIdCounter.current++;
      setChatEntries((prev) => [
        ...prev,
        { ...entry, id: String(chatIdCounter.current) },
      ]);
    },
    []
  );

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999",
    room: code,
    onMessage(event) {
      const msg = JSON.parse(event.data) as ServerMessage;

      switch (msg.type) {
        case "sync":
          setPlayers(msg.players);
          setSettings(msg.settings);
          setHostId(msg.hostId);
          if (msg.game) {
            setGame(msg.game);
            setStrokes(msg.game.strokes);
          }
          break;

        case "player-joined":
          setPlayers((prev) => [...prev, msg.player]);
          setHostId(msg.hostId);
          addChatEntry({
            type: "system",
            text: `${msg.player.name} joined the room`,
          });
          break;

        case "player-left":
          setPlayers((prev) => {
            const leaving = prev.find((p) => p.id === msg.id);
            if (leaving) {
              addChatEntry({
                type: "system",
                text: `${leaving.name} left the room`,
              });
            }
            return prev.filter((p) => p.id !== msg.id);
          });
          break;

        case "settings-updated":
          setSettings(msg.settings);
          break;

        case "game-started":
          setGame(msg.game);
          setStrokes([]);
          setChatEntries([]);
          setRevealedWord(null);
          addChatEntry({ type: "system", text: "🎮 Game started!" });
          break;

        case "pick-words":
          setWordChoices(msg.words);
          break;

        case "phase-change":
          setGame(msg.game);
          setStrokes(msg.game.strokes);
          setRevealedWord(null);
          if (msg.game.phase === "picking") {
            setWordChoices([]);
          }
          if (msg.game.phase === "lobby") {
            addChatEntry({ type: "system", text: "🏠 Back to lobby" });
          }
          break;

        case "timer-tick":
          setGame((prev) => (prev ? { ...prev, timeLeft: msg.timeLeft } : null));
          break;

        case "draw-stroke":
          setStrokes((prev) => [...prev, msg.stroke]);
          break;

        case "clear-canvas":
          setStrokes([]);
          break;

        case "correct-guess":
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === msg.playerId
                ? { ...p, hasGuessedCorrectly: true }
                : p
            )
          );
          addChatEntry({
            type: "correct",
            playerName: msg.playerName,
            text: "",
          });
          break;

        case "chat-message":
          addChatEntry({
            type: "guess",
            playerName: msg.playerName,
            text: msg.text,
          });
          break;

        case "hint-update":
          setGame((prev) => (prev ? { ...prev, hint: msg.hint } : null));
          break;

        case "round-end":
          setRevealedWord(msg.word);
          setGame((prev) => (prev ? { ...prev, phase: "roundEnd" } : null));
          setPlayers((prev) =>
            prev.map((p) => ({
              ...p,
              score: msg.scores[p.id] ?? p.score,
              hasGuessedCorrectly: false,
            }))
          );
          addChatEntry({
            type: "system",
            text: `⏰ The word was: ${msg.word}`,
          });
          break;

        case "game-end":
          setGame((prev) => (prev ? { ...prev, phase: "gameEnd" } : null));
          setPlayers((prev) =>
            prev.map((p) => ({
              ...p,
              score: msg.scores[p.id] ?? p.score,
            }))
          );
          addChatEntry({ type: "system", text: "🏁 Game over!" });
          break;
      }
    },
  });

  // Send join message on connect
  useEffect(() => {
    if (socket && !hasSentJoin.current) {
      const joinMsg: ClientMessage = { type: "join", name };
      socket.send(JSON.stringify(joinMsg));
      hasSentJoin.current = true;
    }
  }, [socket, name]);


  const myId = socket.id;

  function send(msg: ClientMessage) {
    socket.send(JSON.stringify(msg));
  }

  const isHost = myId === hostId;
  const phase = game?.phase ?? "lobby";
  const isDrawer = game?.currentDrawer === myId;

  // --- LOBBY ---
  if (phase === "lobby" || !game) {
    return (
      <Lobby
        code={code}
        players={players}
        settings={settings}
        isHost={isHost}
        myId={myId}
        chatEntries={chatEntries}
        onChat={(text) => send({ type: "chat", text })}
        onUpdateSettings={(s) => send({ type: "update-settings", settings: s })}
        onStartGame={() => send({ type: "start-game" })}
      />
    );
  }

  // --- PICKING PHASE (drawer picks a word) ---
  if (phase === "picking" && isDrawer && wordChoices.length > 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center">
        <WordPicker
          words={wordChoices}
          onPick={(word) => send({ type: "pick-word", word })}
          timeLeft={game.timeLeft}
        />
      </main>
    );
  }

  // --- PICKING PHASE (waiting for drawer) ---
  if (phase === "picking") {
    const drawerName = players.find((p) => p.id === game.currentDrawer)?.name;
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="animate-bounce-soft text-6xl">🎨</div>
        <p className="text-xl font-bold">
          <span className="text-accent-light">{drawerName}</span> is choosing a
          word...
        </p>
        <span className="text-3xl font-bold text-warning">{game.timeLeft}s</span>
      </main>
    );
  }

  // --- GAME END ---
  if (phase === "gameEnd") {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="text-center">
          <h1 className="bg-gradient-warm bg-clip-text text-4xl font-black text-transparent">
            🏁 Game Over!
          </h1>
        </div>
        <div className="flex flex-col items-center gap-3">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex w-72 items-center justify-between rounded-2xl px-5 py-3 ${
                i === 0
                  ? "glow-accent border-2 border-accent bg-accent/10 text-lg font-bold"
                  : "border border-surface-light bg-surface"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                <span>{p.name}</span>
              </span>
              <span className="font-mono font-bold text-accent-light">{p.score}</span>
            </div>
          ))}
        </div>
        <p className="animate-bounce-soft text-sm text-foreground/40">
          Returning to lobby...
        </p>
      </main>
    );
  }

  // --- DRAWING / ROUND END ---
  const drawerName = players.find((p) => p.id === game.currentDrawer)?.name;

  return (
    <main className="flex flex-1 flex-col gap-3 p-3">
      {/* Top Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-surface-light bg-surface px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent-light">
            Round {game.round}/{game.totalRounds}
          </span>
        </div>
        <div className="text-center">
          {phase === "roundEnd" && revealedWord ? (
            <span className="text-lg font-bold text-warning">
              ✨ {revealedWord}
            </span>
          ) : isDrawer ? (
            <span className="text-lg font-bold text-success">
              ✏️ {game.currentWord}
            </span>
          ) : (
            <span className="font-mono text-lg font-bold tracking-[0.3em] text-foreground/80">
              {game.hint ?? "_ ".repeat(game.wordLength ?? 5).trim()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-2xl font-black ${
              game.timeLeft <= 10 ? "animate-pulse-urgent text-danger" : "text-foreground"
            }`}
          >
            {game.timeLeft}
          </span>
          <span className="text-xs text-foreground/40">s</span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-1 gap-3 min-h-0">
        {/* Scoreboard */}
        <div className="hidden w-52 md:block">
          <Scoreboard
            players={players}
            currentDrawer={game.currentDrawer}
            myId={myId}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <Canvas
            isDrawer={isDrawer && phase === "drawing"}
            strokes={strokes}
            onStroke={(stroke) => send({ type: "draw-stroke", stroke })}
            onClear={() => send({ type: "clear-canvas" })}
          />
        </div>

        {/* Chat */}
        <div className="hidden w-64 rounded-2xl border border-surface-light bg-surface md:flex md:flex-col">
          <ChatBox
            entries={chatEntries}
            onGuess={(text) => send({ type: "guess", text })}
            disabled={isDrawer || phase !== "drawing"}
          />
        </div>
      </div>

      {/* Mobile: Scoreboard + Chat */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="h-48">
          <div className="h-full rounded-2xl border border-surface-light bg-surface">
            <ChatBox
              entries={chatEntries}
              onGuess={(text) => send({ type: "guess", text })}
              disabled={isDrawer || phase !== "drawing"}
            />
          </div>
        </div>
      </div>

      {/* Who's drawing */}
      {!isDrawer && phase === "drawing" && (
        <p className="text-center text-xs text-foreground/40">
          🎨 <span className="font-medium text-accent-light">{drawerName}</span> is drawing
        </p>
      )}
    </main>
  );
}
