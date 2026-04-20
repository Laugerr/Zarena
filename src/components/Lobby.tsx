"use client";

import type { Player, RoomSettings } from "@/lib/types";
import ChatBox, { type ChatEntry } from "@/components/ChatBox";

type LobbyProps = {
  code: string;
  players: Player[];
  settings: RoomSettings;
  isHost: boolean;
  myId: string;
  chatEntries: ChatEntry[];
  onChat: (text: string) => void;
  onUpdateSettings: (settings: RoomSettings) => void;
  onStartGame: () => void;
};

const DRAW_TIME_OPTIONS = [30, 45, 60, 90, 120];
const ROUNDS_OPTIONS = [1, 2, 3, 4, 5];
const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 10, 12];
const WORD_COUNT_OPTIONS = [2, 3, 4];
const HINTS_OPTIONS = [0, 1, 2, 3];

export default function Lobby({
  code,
  players,
  settings,
  isHost,
  chatEntries,
  onChat,
  onUpdateSettings,
  onStartGame,
}: LobbyProps) {
  function updateSetting<K extends keyof RoomSettings>(
    key: K,
    value: RoomSettings[K]
  ) {
    onUpdateSettings({ ...settings, [key]: value });
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-4 pt-8">
      {/* Room Header */}
      <div className="text-center">
        <h1 className="bg-gradient-fun bg-clip-text text-3xl font-black text-transparent">
          🎮 Zarena
        </h1>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-sm text-foreground/50">Room</span>
          <span className="rounded-lg bg-surface-light px-4 py-1.5 font-mono text-lg font-bold tracking-[0.2em] text-accent-light">
            {code}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="rounded-lg bg-surface px-3 py-1.5 text-sm transition-all hover:bg-surface-light"
            title="Copy invite link"
          >
            📋
          </button>
        </div>
      </div>

      {/* Settings + Players + Chat Grid */}
      <div className="flex w-full max-w-4xl flex-col gap-4 lg:flex-row">
        {/* Settings Panel */}
        <div className="flex-1 rounded-2xl border border-surface-light bg-surface p-5">
          <h2 className="mb-4 text-base font-bold text-foreground/80">⚙️ Settings</h2>
          <div className="flex flex-col gap-3">
            <SettingRow label="👥 Players">
              <Select
                options={MAX_PLAYERS_OPTIONS}
                value={settings.maxPlayers}
                onChange={(v) => updateSetting("maxPlayers", v)}
                disabled={!isHost}
              />
            </SettingRow>
            <SettingRow label="🌐 Language">
              <span className="rounded-lg bg-surface-light px-3 py-1.5 text-sm text-foreground/60">
                English
              </span>
            </SettingRow>
            <SettingRow label="⏱️ Draw Time">
              <Select
                options={DRAW_TIME_OPTIONS}
                value={settings.drawTime}
                onChange={(v) => updateSetting("drawTime", v)}
                disabled={!isHost}
                suffix="s"
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
            <SettingRow label="🎲 Mode">
              <span className="rounded-lg bg-surface-light px-3 py-1.5 text-sm text-foreground/60">
                Normal
              </span>
            </SettingRow>
            <SettingRow label="📝 Words">
              <Select
                options={WORD_COUNT_OPTIONS}
                value={settings.wordCount}
                onChange={(v) => updateSetting("wordCount", v)}
                disabled={!isHost}
              />
            </SettingRow>
            <SettingRow label="💡 Hints">
              <Select
                options={HINTS_OPTIONS}
                value={settings.hints}
                onChange={(v) => updateSetting("hints", v)}
                disabled={!isHost}
              />
            </SettingRow>
          </div>
        </div>

        {/* Players Panel */}
        <div className="w-full rounded-2xl border border-surface-light bg-surface p-5 lg:w-56">
          <h2 className="mb-4 text-base font-bold text-foreground/80">
            🎭 Players{" "}
            <span className="text-sm font-normal text-foreground/40">
              {players.length}/{settings.maxPlayers}
            </span>
          </h2>
          <ul className="flex flex-col gap-2">
            {players.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-xl bg-surface-light px-3 py-2 text-sm font-medium"
              >
                <span className="text-lg">
                  {i === 0 ? "👑" : "🎭"}
                </span>
                <span className="truncate">{p.name}</span>
              </li>
            ))}
            {players.length === 0 && (
              <li className="animate-bounce-soft text-center text-sm text-foreground/30">
                Waiting for players...
              </li>
            )}
          </ul>
        </div>

        {/* Chat Panel */}
        <div className="h-64 w-full rounded-2xl border border-surface-light bg-surface lg:h-auto lg:w-64">
          <ChatBox
            entries={chatEntries}
            onGuess={onChat}
            disabled={false}
            placeholder="Say something... 💬"
          />
        </div>
      </div>

      {/* Start Button */}
      {isHost ? (
        <button
          onClick={onStartGame}
          disabled={players.length < 2}
          className="glow-accent rounded-xl bg-gradient-fun px-10 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          🚀 Start Game{" "}
          {players.length < 2 && (
            <span className="text-sm font-normal opacity-80">
              (need 2+ players)
            </span>
          )}
        </button>
      ) : (
        <p className="animate-bounce-soft text-foreground/50">
          ⏳ Waiting for host to start...
        </p>
      )}
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-foreground/70">{label}</span>
      {children}
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
      className="rounded-lg border border-surface-light bg-surface-light px-3 py-1.5 text-sm font-medium text-foreground focus:border-accent focus:outline-none disabled:opacity-40"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}{suffix}
        </option>
      ))}
    </select>
  );
}
