/** Represents a player in a room */
export type Player = {
  id: string;
  name: string;
};

/** Messages sent from client to PartyKit server */
export type ClientMessage = { type: "join"; name: string };

/** Messages sent from PartyKit server to clients */
export type ServerMessage =
  | { type: "sync"; players: Player[] }
  | { type: "player-joined"; player: Player }
  | { type: "player-left"; id: string };
