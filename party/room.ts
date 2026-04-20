import type { Party, Server, Connection } from "partykit/server";
import type { ClientMessage, ServerMessage, Player } from "../src/lib/types";

export default class RoomServer implements Server {
  readonly room: Party;
  readonly players = new Map<string, Player>();

  constructor(room: Party) {
    this.room = room;
  }

  onConnect(conn: Connection) {
    console.log(`[${this.room.id}] Connected: ${conn.id}`);

    // Send current player list to the newly connected client
    const sync: ServerMessage = {
      type: "sync",
      players: Array.from(this.players.values()),
    };
    conn.send(JSON.stringify(sync));
  }

  onMessage(message: string, sender: Connection) {
    const data = JSON.parse(message) as ClientMessage;

    switch (data.type) {
      case "join": {
        const player: Player = { id: sender.id, name: data.name };
        this.players.set(sender.id, player);
        console.log(
          `[${this.room.id}] Joined: ${player.name} (${sender.id})`
        );

        // Broadcast to all clients that a new player joined
        this.broadcast({ type: "player-joined", player });
        break;
      }
    }
  }

  onClose(conn: Connection) {
    const player = this.players.get(conn.id);
    if (player) {
      this.players.delete(conn.id);
      console.log(
        `[${this.room.id}] Disconnected: ${player.name} (${conn.id})`
      );
      this.broadcast({ type: "player-left", id: conn.id });
    }
  }

  private broadcast(message: ServerMessage) {
    this.room.broadcast(JSON.stringify(message));
  }
}
