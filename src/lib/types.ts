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
  gameMode: "draw" | "geo";
  wordCount: number;
  hints: number;
  geoTime: number;
  useCustomWords: boolean;
  customWords: string; // comma or newline separated
};

export const DEFAULT_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  language: "en",
  drawTime: 60,
  rounds: 3,
  gameMode: "draw",
  wordCount: 3,
  hints: 2,
  geoTime: 60,
  useCustomWords: false,
  customWords: "",
};

/** Game phase */
export type GamePhase = "lobby" | "picking" | "drawing" | "roundEnd" | "gameEnd" | "geoGuessing" | "geoResults";

/** A single drawing stroke */
export type Stroke = {
  points: { x: number; y: number }[];
  color: string;
  size: number;
};

/** A lat/lng coordinate */
export type LatLng = { lat: number; lng: number };

/** A GeoGuess location */
export type GeoLocation = {
  id: string;
  position: LatLng;
  heading: number;
  name: string; // revealed after round
};

/** A player's geo guess */
export type GeoGuessResult = {
  playerId: string;
  playerName: string;
  guess: LatLng;
  distance: number; // km
  points: number;
};

/** Game state sent to clients */
export type GameState = {
  phase: GamePhase;
  // Draw & Guess
  currentDrawer: string | null;
  currentWord: string | null;
  wordLength: number | null;
  hint: string | null;
  strokes: Stroke[];
  // GeoGuess
  geoLocation: { lat: number; lng: number; heading: number } | null;
  geoGuesses: GeoGuessResult[];
  geoLocationName: string | null;
  // Shared
  timeLeft: number;
  round: number;
  totalRounds: number;
  scores: Record<string, number>;
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
  | { type: "chat"; text: string }
  | { type: "geo-guess"; position: LatLng }
  | { type: "end-game" };

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
  | { type: "game-end"; scores: Record<string, number> }
  | { type: "geo-round-results"; results: GeoGuessResult[]; location: GeoLocation; scores: Record<string, number> }
  | { type: "player-guessed"; playerId: string };
