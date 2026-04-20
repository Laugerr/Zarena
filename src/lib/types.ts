/** Represents a player in a room */
export type Player = {
  id: string;
  name: string;
  score: number;
  hasGuessedCorrectly: boolean;
};

/** Room settings configured by the host */
export type RoomSettings = {
  maxPlayers: number;
  language: "en";
  drawTime: number;
  rounds: number;
  gameMode: "normal";
  wordCount: number;
  hints: number;
};

export const DEFAULT_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  language: "en",
  drawTime: 60,
  rounds: 3,
  gameMode: "normal",
  wordCount: 3,
  hints: 2,
};

/** Game phase */
export type GamePhase = "lobby" | "picking" | "drawing" | "roundEnd" | "gameEnd";

/** A single drawing stroke */
export type Stroke = {
  points: { x: number; y: number }[];
  color: string;
  size: number;
};

/** Game state sent to clients */
export type GameState = {
  phase: GamePhase;
  currentDrawer: string | null;
  currentWord: string | null; // only sent to the drawer
  wordLength: number | null;
  hint: string | null; // e.g. "_ a _ _ l e"
  timeLeft: number;
  round: number;
  totalRounds: number;
  scores: Record<string, number>;
  strokes: Stroke[];
};

/** Messages sent from client to PartyKit server */
export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "update-settings"; settings: RoomSettings }
  | { type: "start-game" }
  | { type: "pick-word"; word: string }
  | { type: "draw-stroke"; stroke: Stroke }
  | { type: "clear-canvas" }
  | { type: "guess"; text: string }
  | { type: "chat"; text: string };

/** Messages sent from PartyKit server to clients */
export type ServerMessage =
  | { type: "sync"; players: Player[]; settings: RoomSettings; hostId: string; game: GameState | null }
  | { type: "player-joined"; player: Player; hostId: string }
  | { type: "player-left"; id: string }
  | { type: "settings-updated"; settings: RoomSettings }
  | { type: "game-started"; game: GameState }
  | { type: "pick-words"; words: string[] }
  | { type: "phase-change"; game: GameState }
  | { type: "timer-tick"; timeLeft: number }
  | { type: "draw-stroke"; stroke: Stroke }
  | { type: "clear-canvas" }
  | { type: "correct-guess"; playerId: string; playerName: string }
  | { type: "chat-message"; playerId: string; playerName: string; text: string }
  | { type: "hint-update"; hint: string }
  | { type: "round-end"; word: string; scores: Record<string, number> }
  | { type: "game-end"; scores: Record<string, number> };
