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
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      {/* Room Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">🎮 Zarena</h1>
        <p className="mt-2 text-foreground/60">
          Room Code:{" "}
          <span className="font-mono text-lg font-bold tracking-widest">
            {code}
          </span>
        </p>
      </div>

      {/* Settings + Players Grid */}
      <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row">
        {/* Settings Panel */}
        <div className="flex-1 rounded-lg border border-foreground/10 p-6">
          <h2 className="mb-4 text-lg font-semibold">⚙️ Settings</h2>
          <div className="flex flex-col gap-4">
            <SettingRow label="👥 Players">
              <Select
                options={MAX_PLAYERS_OPTIONS}
                value={settings.maxPlayers}
                onChange={(v) => updateSetting("maxPlayers", v)}
                disabled={!isHost}
              />
            </SettingRow>
            <SettingRow label="🌐 Language">
              <span className="rounded bg-foreground/5 px-3 py-1.5 text-sm">
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
            <SettingRow label="🎲 Game Mode">
              <span className="rounded bg-foreground/5 px-3 py-1.5 text-sm">
                Normal
              </span>
            </SettingRow>
            <SettingRow label="📝 Word Choices">
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
        <div className="w-full rounded-lg border border-foreground/10 p-6 md:w-64">
          <h2 className="mb-4 text-lg font-semibold">
            🎭 Players ({players.length}/{settings.maxPlayers})
          </h2>
          <ul className="flex flex-col gap-2">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded bg-foreground/5 px-3 py-2 text-sm font-medium"
              >
                <span>{p.name}</span>
                {p.id === players[0]?.id && (
                  <span className="ml-auto text-xs text-yellow-500">👑</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat */}
      <div className="w-full max-w-3xl h-48">
        <ChatBox
          entries={chatEntries}
          onGuess={onChat}
          disabled={false}
          placeholder="Type a message..."
        />
      </div>

      {/* Start Button */}
      {isHost && (
        <button
          onClick={onStartGame}
          disabled={players.length < 2}
          className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚀 Start Game {players.length < 2 && "(need 2+ players)"}
        </button>
      )}
      {!isHost && (
        <p className="text-foreground/60">⏳ Waiting for host to start...</p>
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
      <span className="text-sm font-medium">{label}</span>
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
      className="rounded border border-foreground/20 bg-transparent px-3 py-1.5 text-sm disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}{suffix}
        </option>
      ))}
    </select>
  );
}
