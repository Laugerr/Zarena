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
  const name = useMemo(() => {
    const fromUrl = searchParams.get("name");
    if (fromUrl) {
      sessionStorage.setItem(`zarena-name-${code}`, fromUrl);
      return fromUrl;
    }
    const stored = sessionStorage.getItem(`zarena-name-${code}`);
    if (stored) return stored;
    const random = generateName();
    sessionStorage.setItem(`zarena-name-${code}`, random);
    return random;
  }, [searchParams, code]);
  const hasSentJoin = useRef(false);

  // Clean the URL so sharing doesn't include ?name=
  useEffect(() => {
    if (searchParams.get("name")) {
      window.history.replaceState({}, "", `/room/${code}`);
    }
  }, [searchParams, code]);

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
          // Clear word choices when we move to drawing (drawer already picked)
          if (msg.game.phase === "drawing" || msg.game.phase === "lobby") {
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
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-dots">
        <div className="relative">
          <div className="animate-float text-7xl">🎨</div>
          <div className="absolute -top-2 -right-2 animate-spin-slow text-2xl">✨</div>
        </div>
        <div className="text-center animate-slide-up">
          <p className="text-2xl font-black text-pink">
            {drawerName}
          </p>
          <p className="mt-2 text-foreground/40">is choosing a word...</p>
        </div>
        <div className="glass rounded-2xl px-6 py-3 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
          <span className="text-2xl font-black text-warning">{game.timeLeft}</span>
          <span className="text-xs text-foreground/30">sec</span>
        </div>
      </main>
    );
  }

  // --- GAME END ---
  if (phase === "gameEnd") {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-10 p-4 bg-dots overflow-hidden">
        {/* Trophy animation */}
        <div className="relative animate-slide-up">
          <div className="text-7xl animate-float">🏆</div>
          <div className="absolute -top-3 -left-3 text-2xl animate-spin-slow">⭐</div>
          <div className="absolute -bottom-2 -right-3 text-xl animate-float-slow">✨</div>
        </div>

        <h1 className="animate-slide-up bg-gradient-warm bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
          Game Over!
        </h1>

        <div className="flex flex-col items-center gap-3 w-full max-w-sm stagger">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`animate-slide-up flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all ${
                i === 0
                  ? "glow-purple glass border-2 border-accent scale-105"
                  : i === 1
                  ? "glass border border-pink/20"
                  : i === 2
                  ? "glass border border-cyan/20"
                  : "glass"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                <span className={`font-bold ${i === 0 ? "text-lg" : ""}`}>{p.name}</span>
              </span>
              <span className={`font-mono font-black ${
                i === 0 ? "text-xl text-accent-light" : "text-foreground/60"
              }`}>
                {p.score}
              </span>
            </div>
          ))}
        </div>

        <div className="animate-float flex items-center gap-2 text-foreground/30">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-sm">Returning to lobby...</span>
        </div>
      </main>
    );
  }

  // --- DRAWING / ROUND END ---
  const drawerName = players.find((p) => p.id === game.currentDrawer)?.name;

  return (
    <main className="flex flex-1 flex-col gap-3 p-3 bg-gradient-game">
      {/* Top Bar */}
      <div className="glass flex items-center justify-between rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-accent/20 px-3 py-1 text-xs font-black text-accent-light">
            {game.round}/{game.totalRounds}
          </span>
          {!isDrawer && phase === "drawing" && (
            <span className="text-xs text-foreground/30">
              🎨 <span className="text-pink">{drawerName}</span>
            </span>
          )}
        </div>

        {/* Word / Hint */}
        <div className="text-center">
          {phase === "roundEnd" && revealedWord ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/40">The word was</span>
              <span className="rounded-xl bg-warning/20 px-3 py-1 text-lg font-black text-warning">
                {revealedWord}
              </span>
            </div>
          ) : isDrawer ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/40">Draw:</span>
              <span className="rounded-xl bg-success/20 px-4 py-1 text-lg font-black text-success">
                {game.currentWord}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[60vw]">
              {(game.hint ?? "_ ".repeat(game.wordLength ?? 5).trim())
                .split(" ")
                .map((ch, i) => (
                  <span
                    key={i}
                    className={`flex h-7 w-5 sm:h-8 sm:w-6 items-center justify-center rounded text-sm sm:text-base font-black ${
                      ch === "_"
                        ? "bg-surface-lighter text-foreground/20"
                        : "bg-accent/20 text-accent-light"
                    }`}
                  >
                    {ch === "_" ? "" : ch}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          game.timeLeft <= 10
            ? "bg-danger/20 animate-pulse-urgent"
            : game.timeLeft <= 20
            ? "bg-warning/20"
            : "bg-surface-lighter"
        }`}>
          <span className={`text-lg font-black ${
            game.timeLeft <= 10
              ? "text-danger"
              : game.timeLeft <= 20
              ? "text-warning"
              : "text-foreground"
          }`}>
            {game.timeLeft}
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-1 gap-3 min-h-0">
        {/* Scoreboard */}
        <div className="hidden w-48 lg:block">
          <Scoreboard
            players={players}
            currentDrawer={game.currentDrawer}
            myId={myId}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Canvas
            isDrawer={isDrawer && phase === "drawing"}
            strokes={strokes}
            onStroke={(stroke) => send({ type: "draw-stroke", stroke })}
            onClear={() => { setStrokes([]); send({ type: "clear-canvas" }); }}
          />
        </div>

        {/* Chat */}
        <div className="hidden w-60 glass rounded-3xl lg:flex lg:flex-col overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
              {isDrawer ? "Chat" : "Guess here"}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <ChatBox
              entries={chatEntries}
              onGuess={(text) => send({ type: "guess", text })}
              disabled={isDrawer || phase !== "drawing"}
              placeholder={isDrawer ? "You're drawing!" : "Type your guess..."}
            />
          </div>
        </div>
      </div>

      {/* Mobile Chat */}
      <div className="h-44 lg:hidden glass rounded-3xl overflow-hidden">
        <ChatBox
          entries={chatEntries}
          onGuess={(text) => send({ type: "guess", text })}
          disabled={isDrawer || phase !== "drawing"}
          placeholder={isDrawer ? "You're drawing!" : "Type your guess..."}
        />
      </div>
    </main>
  );
}
