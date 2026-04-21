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
    description: "Draw fast. Guess faster.",
    gradient: "from-pink-500 to-amber-500",
  },
  {
    id: "geo" as const,
    name: "GeoGuess",
    icon: "🌍",
    description: "Find the place from Street View.",
    gradient: "from-cyan to-accent",
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
    <div className="flex flex-1 min-h-0 flex-col items-center gap-3 overflow-y-auto bg-dots p-3 pt-4 pb-28 sm:gap-6 sm:p-4 sm:pt-6 sm:pb-6">
      <div className="animate-slide-up text-center">
        <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-3xl font-black text-transparent">
          Zarena
        </h1>
        <div className="mt-3 flex items-center justify-center">
          <div className="glass flex max-w-full items-center gap-2 rounded-2xl px-3 py-2 sm:gap-3 sm:px-5">
            <span className="text-xs uppercase tracking-wider text-foreground/40">
              Room
            </span>
            <span className="font-mono text-lg font-black tracking-[0.18em] text-cyan sm:text-xl sm:tracking-[0.2em]">
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

      <div className="flex w-full max-w-5xl flex-col gap-3 sm:gap-4 lg:min-h-0 lg:flex-1 lg:flex-row">
        <section
          className="animate-slide-up glass flex shrink-0 flex-col rounded-3xl p-3 sm:p-5 lg:w-64 lg:max-h-none"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/50 sm:mb-4">
            <span className="text-base">🎭</span> Players
            <span className="ml-auto rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent-light">
              {players.length}/{settings.maxPlayers}
            </span>
          </h2>
          <div className="min-h-0 overflow-y-auto">
            <ul className="flex flex-col gap-2 stagger">
              {players.map((p, i) => (
                <li
                  key={p.id}
                  className="animate-slide-up flex items-center gap-3 rounded-2xl bg-surface-light/50 px-4 py-3 transition-all hover:bg-surface-lighter/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-lighter text-lg">
                    {getAvatar(p.id)}
                  </div>
                  <span className="truncate font-bold">{p.name}</span>
                  {i === 0 && (
                    <span className="ml-auto shrink-0 rounded-lg bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">
                      👑 Host
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {players.length < 2 && (
              <div className="mt-3 flex items-center justify-center gap-2 text-center sm:flex-col">
                <div className="animate-float text-2xl sm:text-3xl">👋</div>
                <p className="text-xs text-foreground/30 sm:text-sm">
                  Share the room code to invite friends!
                </p>
              </div>
            )}
          </div>
        </section>

        <section
          className="animate-slide-up flex flex-col lg:min-h-0 lg:flex-1"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/50 sm:mb-4">
            <span className="text-base">🎮</span> Choose a Game
            {!isHost && (
              <span className="ml-1 text-[10px] normal-case text-foreground/30">
                (host picks)
              </span>
            )}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex-1 lg:content-start">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                disabled={!isHost}
                className="group glass rounded-3xl p-3 text-left transition-all hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:p-6 card-hover"
              >
                <div className="mb-2 text-3xl transition-all group-hover:animate-float sm:mb-4 sm:text-5xl">
                  {game.icon}
                </div>
                <h3
                  className={`bg-gradient-to-r ${game.gradient} bg-clip-text text-base font-black text-transparent sm:text-xl`}
                >
                  {game.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-foreground/40 sm:mt-2 sm:text-sm">
                  {game.description}
                </p>
                {isHost && (
                  <div
                    className={`mt-3 rounded-xl bg-gradient-to-r ${game.gradient} px-3 py-2 text-center text-[10px] font-black text-white opacity-100 transition-opacity group-hover:opacity-100 sm:mt-4 sm:px-4 sm:text-xs sm:opacity-0`}
                  >
                    SELECT
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section
          className="animate-slide-up glass flex h-52 shrink-0 flex-col overflow-hidden rounded-3xl sm:h-64 lg:h-auto lg:w-64 lg:max-h-none lg:self-stretch"
          style={{ animationDelay: "300ms" }}
        >
          <div className="shrink-0 px-4 pt-3 pb-2 sm:pt-4">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/50">
              <span className="text-base">💬</span> Chat
            </h2>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatBox
              entries={chatEntries}
              onGuess={onChat}
              disabled={false}
              placeholder="Say hi! 👋"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
