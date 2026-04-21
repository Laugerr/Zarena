"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import { generateName } from "@/lib/names";
import { DEFAULT_SETTINGS } from "@/lib/types";
import type {
  ClientMessage,
  GameState,
  GeoGuessResult,
  GeoLocation,
  Player,
  RoomSettings,
  ServerMessage,
  Stroke,
} from "@/lib/types";
import Lobby from "@/components/Lobby";
import DrawLobby from "@/components/DrawLobby";
import GeoLobby from "@/components/GeoLobby";
import Canvas from "@/components/Canvas";
import ChatBox, { type ChatEntry } from "@/components/ChatBox";
import WordPicker from "@/components/WordPicker";
import Scoreboard from "@/components/Scoreboard";
import GeoStreetView from "@/components/GeoStreetView";
import GeoGuessMap from "@/components/GeoGuessMap";
import GeoResults from "@/components/GeoResults";

function formatTimer(seconds: number): string {
  if (seconds < 60) return String(seconds);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get("name")?.trim();
    if (fromUrl) {
      sessionStorage.setItem(`zarena-name-${code}`, fromUrl);
      setName(fromUrl);
      window.history.replaceState({}, "", `/room/${code}`);
      return;
    }

    const stored = sessionStorage.getItem(`zarena-name-${code}`);
    if (stored) {
      setName(stored);
    }
  }, [searchParams, code]);

  function handleChooseName(chosenName: string) {
    const trimmed = chosenName.trim();
    if (!trimmed) return;
    sessionStorage.setItem(`zarena-name-${code}`, trimmed);
    setName(trimmed);
  }

  if (!name) {
    return <NameGate code={code} onChooseName={handleChooseName} />;
  }

  return <RoomSession code={code} name={name} />;
}

function NameGate({
  code,
  onChooseName,
}: {
  code: string;
  onChooseName: (name: string) => void;
}) {
  const [draftName, setDraftName] = useState(() => generateName());
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draftName.trim();
    if (!trimmed) {
      setError("Choose a name to join the room!");
      return;
    }
    onChooseName(trimmed);
  }

  return (
    <main className="relative flex flex-1 min-h-0 flex-col items-center justify-center overflow-y-auto bg-dots p-4">
      <div className="animate-slide-up w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-5xl font-black tracking-tighter text-transparent">
            Zarena
          </h1>
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-surface-lighter bg-surface/70 px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/35">
              Room
            </span>
            <span className="font-mono text-lg font-black tracking-[0.25em] text-cyan">
              {code}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-foreground/40">
            Choose your name
          </label>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                setError("");
              }}
              maxLength={16}
              className="min-w-0 flex-1 rounded-2xl border-2 border-surface-lighter bg-surface px-4 py-3.5 text-center text-lg font-bold text-foreground placeholder:text-foreground/20 transition-colors focus:border-accent focus:outline-none"
              placeholder="Enter name..."
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setDraftName(generateName());
                setError("");
              }}
              className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl border-2 border-surface-lighter bg-surface text-xl transition-all hover:scale-110 hover:border-accent active:scale-95"
              title="Random name"
            >
              🎲
            </button>
          </div>
          {error && (
            <p className="mt-3 text-center text-sm font-semibold text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-5 w-full rounded-2xl bg-gradient-main px-6 py-4 text-lg font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Join Room
          </button>
        </form>
      </div>
    </main>
  );
}

function RoomSession({ code, name }: { code: string; name: string }) {
  const hasSentJoin = useRef(false);

  const [lobbyView, setLobbyView] = useState<"hub" | "draw" | "geo">("hub");
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_SETTINGS);
  const [hostId, setHostId] = useState("");
  const [game, setGame] = useState<GameState | null>(null);
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [chatEntries, setChatEntries] = useState<ChatEntry[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [revealedWord, setRevealedWord] = useState<string | null>(null);
  const [hasGeoGuessed, setHasGeoGuessed] = useState(false);
  const [geoResults, setGeoResults] = useState<GeoGuessResult[] | null>(null);
  const [geoResultLocation, setGeoResultLocation] = useState<GeoLocation | null>(null);
  const [geoPlayerGuessed, setGeoPlayerGuessed] = useState<Set<string>>(new Set());

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
          setHasGeoGuessed(false);
          setGeoResults(null);
          setGeoResultLocation(null);
          setGeoPlayerGuessed(new Set());
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
            setLobbyView("hub");
            addChatEntry({ type: "system", text: "🏠 Back to lobby" });
          }
          // Reset geo guess state for new round
          if (msg.game.phase === "geoGuessing") {
            setHasGeoGuessed(false);
            setGeoResults(null);
            setGeoResultLocation(null);
            setGeoPlayerGuessed(new Set());
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

        case "geo-round-results":
          setGeoResults(msg.results);
          setGeoResultLocation(msg.location);
          setGame((prev) => (prev ? { ...prev, phase: "geoResults" } : null));
          setPlayers((prev) =>
            prev.map((p) => ({
              ...p,
              score: msg.scores[p.id] ?? p.score,
            }))
          );
          break;

        case "player-guessed":
          setGeoPlayerGuessed((prev) => new Set(prev).add(msg.playerId));
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
    if (lobbyView === "draw") {
      return (
        <DrawLobby
          code={code}
          players={players}
          settings={settings}
          isHost={isHost}
          chatEntries={chatEntries}
          onChat={(text) => send({ type: "chat", text })}
          onUpdateSettings={(s) => send({ type: "update-settings", settings: { ...s, gameMode: "draw" } })}
          onStartGame={() => {
            send({ type: "update-settings", settings: { ...settings, gameMode: "draw" } });
            send({ type: "start-game" });
          }}
          onBack={() => setLobbyView("hub")}
        />
      );
    }

    if (lobbyView === "geo") {
      return (
        <GeoLobby
          code={code}
          players={players}
          settings={settings}
          isHost={isHost}
          chatEntries={chatEntries}
          onChat={(text) => send({ type: "chat", text })}
          onUpdateSettings={(s) => send({ type: "update-settings", settings: { ...s, gameMode: "geo" } })}
          onStartGame={() => {
            send({ type: "update-settings", settings: { ...settings, gameMode: "geo" } });
            send({ type: "start-game" });
          }}
          onBack={() => setLobbyView("hub")}
        />
      );
    }

    return (
      <Lobby
        code={code}
        players={players}
        settings={settings}
        isHost={isHost}
        myId={myId}
        chatEntries={chatEntries}
        onChat={(text) => send({ type: "chat", text })}
        onSelectGame={(mode) => {
          send({ type: "update-settings", settings: { ...settings, gameMode: mode } });
          setLobbyView(mode);
        }}
      />
    );
  }

  // --- PICKING PHASE (drawer picks a word) ---
  if (phase === "picking" && isDrawer && wordChoices.length > 0) {
    return (
      <main className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-y-auto">
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
      <main className="flex flex-1 min-h-0 flex-col items-center justify-center gap-6 sm:gap-8 bg-dots overflow-y-auto p-4">
        <div className="relative">
          <div className="animate-float text-5xl sm:text-7xl">🎨</div>
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
      <main className="flex flex-1 min-h-0 flex-col items-center justify-center gap-6 sm:gap-10 p-4 bg-dots overflow-y-auto">
        {/* Trophy animation */}
        <div className="relative animate-slide-up">
          <div className="text-5xl sm:text-7xl animate-float">🏆</div>
          <div className="absolute -top-3 -left-3 text-2xl animate-spin-slow">⭐</div>
          <div className="absolute -bottom-2 -right-3 text-xl animate-float-slow">✨</div>
        </div>

        <h1 className="animate-slide-up bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-3xl font-black text-transparent sm:text-4xl md:text-5xl">
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

  // --- GEO RESULTS ---
  if (phase === "geoResults" && geoResults && geoResultLocation) {
    return (
      <GeoResults
        results={geoResults}
        location={geoResultLocation}
        scores={Object.fromEntries(players.map((p) => [p.id, p.score]))}
        myId={myId}
      />
    );
  }

  // --- GEO GUESSING ---
  if (phase === "geoGuessing" && game.geoLocation) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
    const guessedCount = geoPlayerGuessed.size;
    const totalPlayers = players.length;

    return (
      <main className="flex flex-1 min-h-0 flex-col gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-game overflow-hidden">
        {/* Top bar */}
        <div className="glass flex items-center justify-between rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {isHost && (
              <button
                onClick={() => { if (confirm("End game and return to lobby?")) send({ type: "end-game" }); }}
                className="rounded-lg bg-danger/20 px-2 py-1 text-[10px] sm:text-xs font-bold text-danger transition-all hover:bg-danger/30 active:scale-90"
              >
                ✕
              </button>
            )}
            <span className="rounded-xl bg-accent/20 px-2 sm:px-3 py-1 text-xs font-black text-accent-light">
              {game.round}/{game.totalRounds}
            </span>
            <span className="text-xs text-foreground/30 hidden sm:inline">
              🌍 Where is this?
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs text-foreground/40">
              {guessedCount}/{totalPlayers} guessed
            </span>
            <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${
              game.timeLeft <= 10
                ? "bg-danger/20 animate-pulse-urgent"
                : game.timeLeft <= 30
                ? "bg-warning/20"
                : "bg-surface-lighter"
            }`}>
              <span className={`text-sm sm:text-base font-black ${
                game.timeLeft <= 10
                  ? "text-danger"
                  : game.timeLeft <= 30
                  ? "text-warning"
                  : "text-foreground"
              }`}>
                {formatTimer(game.timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Street View + Map */}
        <div className="flex flex-1 gap-2 sm:gap-3 min-h-0 flex-col lg:flex-row overflow-hidden">
          {/* Street View */}
          <div className="flex-[2] min-h-0 min-h-[180px] sm:min-h-[250px]">
            <GeoStreetView
              lat={game.geoLocation.lat}
              lng={game.geoLocation.lng}
              heading={game.geoLocation.heading}
              apiKey={apiKey}
            />
          </div>

          {/* Guess Map */}
          <div className="flex-1 min-h-[180px] lg:max-w-80 lg:min-h-0">
            <GeoGuessMap
              onGuess={(position) => {
                setHasGeoGuessed(true);
                send({ type: "geo-guess", position });
              }}
              hasGuessed={hasGeoGuessed}
              disabled={false}
            />
          </div>
        </div>
      </main>
    );
  }

  // --- DRAWING / ROUND END ---
  const drawerName = players.find((p) => p.id === game.currentDrawer)?.name;

  return (
    <main className="flex flex-1 min-h-0 flex-col gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-game overflow-hidden">
      {/* Top Bar */}
      <div className="glass flex items-center justify-between rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {isHost && (
            <button
              onClick={() => { if (confirm("End game and return to lobby?")) send({ type: "end-game" }); }}
              className="rounded-lg bg-danger/20 px-2 py-1 text-[10px] sm:text-xs font-bold text-danger transition-all hover:bg-danger/30 active:scale-90"
            >
              ✕
            </button>
          )}
          <span className="rounded-xl bg-accent/20 px-2 sm:px-3 py-1 text-xs font-black text-accent-light">
            {game.round}/{game.totalRounds}
          </span>
          {!isDrawer && phase === "drawing" && (
            <span className="text-xs text-foreground/30 hidden sm:inline">
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
            <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 max-w-[50vw] sm:max-w-[60vw]">
              {(game.hint ?? "_ ".repeat(game.wordLength ?? 5).trim())
                .split(" ")
                .map((ch, i) => (
                  <span
                    key={i}
                    className={`flex h-6 w-4 sm:h-8 sm:w-6 items-center justify-center rounded text-xs sm:text-base font-black ${
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
        <div className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${
          game.timeLeft <= 10
            ? "bg-danger/20 animate-pulse-urgent"
            : game.timeLeft <= 20
            ? "bg-warning/20"
            : "bg-surface-lighter"
        }`}>
          <span className={`text-base sm:text-lg font-black ${
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
      <div className="flex flex-1 gap-2 sm:gap-3 min-h-0 overflow-hidden">
        {/* Scoreboard */}
        <div className="hidden w-48 lg:block shrink-0">
          <Scoreboard
            players={players}
            currentDrawer={game.currentDrawer}
            myId={myId}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
          <Canvas
            isDrawer={isDrawer && phase === "drawing"}
            strokes={strokes}
            onStroke={(stroke) => send({ type: "draw-stroke", stroke })}
            onClear={() => { setStrokes([]); send({ type: "clear-canvas" }); }}
          />
        </div>

        {/* Chat */}
        <div className="hidden w-60 shrink-0 glass rounded-3xl lg:flex lg:flex-col overflow-hidden">
          <div className="shrink-0 px-4 pt-3 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
              {isDrawer ? "Chat" : "Guess here"}
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
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
      <div className="h-36 sm:h-44 shrink-0 lg:hidden glass rounded-3xl overflow-hidden">
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
