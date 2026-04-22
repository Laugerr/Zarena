"use client";

import type { Player, RoomSettings } from "@/lib/types";
import { getAvatar } from "@/lib/avatars";
import ChatBox, { type ChatEntry } from "@/components/ChatBox";

type GeoLobbyProps = {
  code: string;
  players: Player[];
  settings: RoomSettings;
  isHost: boolean;
  myId: string;
  chatEntries: ChatEntry[];
  onChat: (text: string) => void;
  onUpdateSettings: (settings: RoomSettings) => void;
  onStartGame: () => void;
  onBack: () => void;
  onKick: (id: string) => void;
};

const GEO_TIME_OPTIONS = [15, 20, 30, 45, 60, 90, 120, 180, 240];
const ROUNDS_OPTIONS = [1, 2, 3, 4, 5];
const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 10, 12];

export default function GeoLobby({
  code,
  players,
  settings,
  isHost,
  myId,
  chatEntries,
  onChat,
  onUpdateSettings,
  onStartGame,
  onBack,
  onKick,
}: GeoLobbyProps) {
  function updateSetting<K extends keyof RoomSettings>(
    key: K,
    value: RoomSettings[K]
  ) {
    onUpdateSettings({ ...settings, [key]: value });
  }

  function copyLink() {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col items-center gap-4 sm:gap-6 p-3 sm:p-4 pt-4 sm:pt-6 bg-dots overflow-y-auto">
      {/* Header */}
      <div className="animate-slide-up text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="rounded-xl bg-surface-lighter px-3 py-1.5 text-xs font-bold transition-all hover:bg-accent hover:text-white active:scale-90"
          >
            ← Back
          </button>
          <h1 className="bg-gradient-to-r from-cyan to-accent bg-clip-text text-3xl font-black text-transparent">
            🌍 GeoGuess
          </h1>
        </div>
        <div className="flex items-center justify-center gap-3">
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
        {/* Left: Settings */}
        <div className="animate-slide-up glass rounded-3xl p-4 sm:p-5 lg:w-72" style={{ animationDelay: "100ms" }}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/50">
            <span className="text-base">⚙️</span> Settings
            {!isHost && <span className="text-[10px] text-foreground/30 normal-case">(host only)</span>}
          </h2>
          <div className="flex flex-col gap-3">
            <SettingRow label="👥 Max Players">
              <Select
                options={MAX_PLAYERS_OPTIONS}
                value={settings.maxPlayers}
                onChange={(v) => updateSetting("maxPlayers", v)}
                disabled={!isHost}
              />
            </SettingRow>
            <SettingRow label="⏱️ Guess Time">
              <TimeSelect
                options={GEO_TIME_OPTIONS}
                value={settings.geoTime}
                onChange={(v) => updateSetting("geoTime", v)}
                disabled={!isHost}
              />
            </SettingRow>
            <SettingRow label="🔄 Rounds">
              <Select
                options={ROUNDS_OPTIONS}
                value={settings.rounds}
                onChange={(v) => updateSetting("rounds", v)}
                disabled={!isHost}
              />
            </SettingRow>
          </div>

          {/* How it works */}
          <div className="mt-6 rounded-2xl bg-surface-light/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">
              How it works
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-foreground/50">
              <li className="flex items-start gap-2">
                <span className="shrink-0">📍</span>
                <span>You see a Google Street View of a famous location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">🗺️</span>
                <span>Click the map to place your guess pin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">📏</span>
                <span>Closer guess = more points (max 5,000)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">⚡</span>
                <span>Everyone guesses at the same time!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Center: Players */}
        <div className="animate-slide-up flex-1 glass rounded-3xl p-4 sm:p-5 flex flex-col max-h-72 sm:max-h-80 lg:max-h-none" style={{ animationDelay: "200ms" }}>
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
                  {i === 0 ? (
                    <span className="ml-auto shrink-0 rounded-lg bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">
                      👑 Host
                    </span>
                  ) : isHost && p.id !== myId ? (
                    <button
                      onClick={() => onKick(p.id)}
                      className="ml-auto shrink-0 rounded-lg bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger/60 hover:bg-danger/20 hover:text-danger transition-all"
                      title={`Kick ${p.name}`}
                    >
                      ✕
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {/* Start / Wait */}
          <div className="mt-4 pt-4 border-t border-surface-lighter/50">
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={players.length < 2}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan to-accent py-4 text-lg font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed animate-pulse-glow"
              >
                {players.length < 2 ? "⏳ Waiting for players..." : "🌍 START GEOGUESS"}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-4 text-foreground/40">
                <div className="animate-wiggle text-xl">⏳</div>
                <span className="font-medium">Waiting for host...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="animate-slide-up glass rounded-3xl overflow-hidden lg:w-72 max-h-60 sm:max-h-80 lg:max-h-none lg:self-stretch flex flex-col" style={{ animationDelay: "300ms" }}>
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

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-9 items-center justify-between gap-3">
      <span className="text-xs font-semibold text-foreground/60">{label}</span>
      <div className="w-24 text-right">{children}</div>
    </div>
  );
}

function Select({
  options,
  value,
  onChange,
  disabled,
  suffix = "",
}: {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  suffix?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-full rounded-xl border border-surface-lighter bg-surface-light px-3 py-1.5 text-center text-xs font-bold text-foreground focus:border-accent focus:outline-none disabled:opacity-30 transition-colors cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}{suffix}
        </option>
      ))}
    </select>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function TimeSelect({
  options,
  value,
  onChange,
  disabled,
}: {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-full rounded-xl border border-surface-lighter bg-surface-light px-3 py-1.5 text-center text-xs font-bold text-foreground focus:border-accent focus:outline-none disabled:opacity-30 transition-colors cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {formatTime(opt)}
        </option>
      ))}
    </select>
  );
}
