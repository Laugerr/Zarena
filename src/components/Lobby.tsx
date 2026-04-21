"use client";

import type { Player, RoomSettings } from "@/lib/types";
import { getAvatar } from "@/lib/avatars";
import ChatBox, { type ChatEntry } from "@/components/ChatBox";

type LobbyProps = {
  code: string;
  players: Player[];
  settings: RoomSettings;
  isHost: boolean;
  myId: string;
  chatEntries: ChatEntry[];
  onChat: (text: string) => void;
  onSelectGame: (mode: "draw" | "geo") => void;
};

const GAMES = [
  {
    id: "draw" as const,
    name: "Draw & Guess",
    icon: "🎨",
    description: "One player draws, others guess the word!",
    gradient: "from-pink-500 to-amber-500",
    glow: "glow-pink",
  },
  {
    id: "geo" as const,
    name: "GeoGuess",
    icon: "🌍",
    description: "Guess the location from Street View!",
    gradient: "from-cyan to-accent",
    glow: "glow-cyan",
  },
];

export default function Lobby({
  code,
  players,
  settings,
  isHost,
  chatEntries,
  onChat,
  onSelectGame,
}: LobbyProps) {
  function copyLink() {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col items-center gap-4 sm:gap-6 p-3 sm:p-4 pt-4 sm:pt-6 bg-dots overflow-y-auto">
      {/* Header */}
      <div className="animate-slide-up text-center">
        <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-3xl font-black text-transparent">
          Zarena
        </h1>
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="glass rounded-2xl px-5 py-2 flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-foreground/40">Room</span>
            <span className="font-mono text-xl font-black tracking-[0.2em] text-cyan">
              {code}
            </span>
            <button
              onClick={copyLink}
              className="rounded-lg bg-surface-lighter px-2.5 py-1 text-xs transition-all hover:bg-accent hover:text-white active:scale-90"
              title="Copy invite link"
            >
              📋 Copy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full max-w-5xl flex-1 flex-col gap-4 lg:flex-row min-h-0">
        {/* Left: Players */}
        <div className="animate-slide-up glass rounded-3xl p-4 sm:p-5 lg:w-64 flex flex-col max-h-60 sm:max-h-80 lg:max-h-none" style={{ animationDelay: "100ms" }}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/50">
            <span className="text-base">🎭</span> Players
            <span className="ml-auto rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent-light">
              {players.length}/{settings.maxPlayers}
            </span>
          </h2>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ul className="flex flex-col gap-2 stagger">
              {players.map((p, i) => (
                <li
                  key={p.id}
                  className="animate-slide-up flex items-center gap-3 rounded-2xl bg-surface-light/50 px-4 py-3 transition-all hover:bg-surface-lighter/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-lighter text-lg shrink-0">
                    {getAvatar(p.id)}
                  </div>
                  <span className="font-bold truncate">{p.name}</span>
                  {i === 0 && (
                    <span className="ml-auto shrink-0 rounded-lg bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">
                      👑 Host
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {players.length < 2 && (
              <div className="mt-4 flex flex-col items-center gap-2 text-center">
                <div className="animate-float text-3xl">👋</div>
                <p className="text-sm text-foreground/30">
                  Share the room code to invite friends!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Games */}
        <div className="animate-slide-up flex-1 flex flex-col min-h-0" style={{ animationDelay: "200ms" }}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/50">
            <span className="text-base">🎮</span> Choose a Game
            {!isHost && <span className="text-[10px] text-foreground/30 normal-case ml-1">(host picks)</span>}
          </h2>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 content-start">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                disabled={!isHost}
                className={`group glass rounded-3xl p-4 sm:p-6 text-left transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed card-hover`}
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:animate-float transition-all">
                  {game.icon}
                </div>
                <h3 className={`text-lg sm:text-xl font-black bg-gradient-to-r ${game.gradient} bg-clip-text text-transparent`}>
                  {game.name}
                </h3>
                <p className="mt-2 text-sm text-foreground/40 leading-relaxed">
                  {game.description}
                </p>
                {isHost && (
                  <div className={`mt-4 rounded-xl bg-gradient-to-r ${game.gradient} px-4 py-2 text-center text-xs font-black text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                    SELECT
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="animate-slide-up glass rounded-3xl overflow-hidden lg:w-64 max-h-60 sm:max-h-80 lg:max-h-none lg:self-stretch flex flex-col" style={{ animationDelay: "300ms" }}>
          <div className="shrink-0 px-4 pt-4 pb-2">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/50">
              <span className="text-base">💬</span> Chat
            </h2>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatBox
              entries={chatEntries}
              onGuess={onChat}
              disabled={false}
              placeholder="Say hi! 👋"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
