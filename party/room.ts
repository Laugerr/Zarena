import type { Party, Server, Connection } from "partykit/server";
import type {
  ClientMessage,
  ServerMessage,
  Player,
  RoomSettings,
  GameState,
  Stroke,
  GamePhase,
  GeoLocation,
  GeoGuessResult,
  LatLng,
} from "../src/lib/types";
import { DEFAULT_SETTINGS } from "../src/lib/types";
import { WORDS_EN } from "../src/lib/words";
import { GEO_LOCATIONS } from "../src/lib/locations";

export default class RoomServer implements Server {
  readonly room: Party;
  readonly players = new Map<string, Player>();
  hostId: string | null = null;
  settings: RoomSettings = { ...DEFAULT_SETTINGS };

  // Game state
  phase: GamePhase = "lobby";
  round = 0;
  turnIndex = 0;
  turnOrder: string[] = [];
  currentWord: string | null = null;
  strokes: Stroke[] = [];
  timeLeft = 0;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  hintsRevealed = 0;
  hintString: string | null = null;
  correctGuessers = new Set<string>();

  // GeoGuess state
  geoLocationPool: GeoLocation[] = [];
  currentGeoLocation: GeoLocation | null = null;
  geoGuesses = new Map<string, LatLng>();

  constructor(room: Party) {
    this.room = room;
  }

  onConnect(conn: Connection) {
    console.log(`[${this.room.id}] Connected: ${conn.id}`);

    const sync: ServerMessage = {
      type: "sync",
      players: Array.from(this.players.values()),
      settings: this.settings,
      hostId: this.hostId ?? "",
      game: this.phase !== "lobby" ? this.getGameStateFor(conn.id) : null,
    };
    conn.send(JSON.stringify(sync));
  }

  onMessage(message: string, sender: Connection) {
    const data = JSON.parse(message) as ClientMessage;

    switch (data.type) {
      case "join":
        this.handleJoin(sender, data.name);
        break;
      case "update-settings":
        this.handleUpdateSettings(sender, data.settings);
        break;
      case "start-game":
        this.handleStartGame(sender);
        break;
      case "pick-word":
        this.handlePickWord(sender, data.word);
        break;
      case "draw-stroke":
        this.handleDrawStroke(sender, data.stroke);
        break;
      case "clear-canvas":
        this.handleClearCanvas(sender);
        break;
      case "guess":
        this.handleGuess(sender, data.text);
        break;
      case "chat":
        this.handleChat(sender, data.text);
        break;
      case "geo-guess":
        this.handleGeoGuess(sender, data.position);
        break;
    }
  }

  onClose(conn: Connection) {
    const player = this.players.get(conn.id);
    if (player) {
      this.players.delete(conn.id);
      console.log(`[${this.room.id}] Left: ${player.name}`);
      this.broadcast({ type: "player-left", id: conn.id });

      // If host left, assign new host
      if (conn.id === this.hostId && this.players.size > 0) {
        this.hostId = this.players.keys().next().value ?? null;
      }

      // If current drawer left during a game, skip to next turn
      if (this.phase === "drawing" && this.getCurrentDrawerId() === conn.id) {
        this.endTurn();
      }

      // In geo mode, check if all remaining players have guessed
      if (this.phase === "geoGuessing") {
        this.geoGuesses.delete(conn.id);
        const allGuessed = Array.from(this.players.keys()).every((id) =>
          this.geoGuesses.has(id)
        );
        if (allGuessed && this.players.size > 0) {
          this.endGeoRound();
        }
      }
    }
  }

  // --- Handlers ---

  private handleJoin(conn: Connection, name: string) {
    const player: Player = {
      id: conn.id,
      name,
      score: 0,
      hasGuessedCorrectly: false,
    };
    this.players.set(conn.id, player);

    if (!this.hostId) {
      this.hostId = conn.id;
    }

    console.log(`[${this.room.id}] Joined: ${player.name} (${conn.id})`);
    this.broadcast({ type: "player-joined", player, hostId: this.hostId ?? "" });
  }

  private handleUpdateSettings(conn: Connection, settings: RoomSettings) {
    if (conn.id !== this.hostId) return;
    if (this.phase !== "lobby") return;

    this.settings = settings;
    this.broadcast({ type: "settings-updated", settings });
  }

  private handleStartGame(conn: Connection) {
    if (conn.id !== this.hostId) return;
    if (this.phase !== "lobby") return;
    if (this.players.size < 2) return;

    // Reset scores
    for (const player of this.players.values()) {
      player.score = 0;
      player.hasGuessedCorrectly = false;
    }

    this.round = 1;
    this.turnIndex = 0;

    if (this.settings.gameMode === "geo") {
      this.startGeoGame();
    } else {
      this.turnOrder = Array.from(this.players.keys());
      this.shuffleArray(this.turnOrder);
      this.phase = "picking";
      this.broadcast({ type: "game-started", game: this.getGameStateFor(null) });
      this.startPickingPhase();
    }
  }

  private handlePickWord(conn: Connection, word: string) {
    if (this.phase !== "picking") return;
    if (conn.id !== this.getCurrentDrawerId()) return;

    this.currentWord = word;
    this.hintString = this.generateHint(word, 0);
    this.startDrawingPhase();
  }

  private handleDrawStroke(conn: Connection, stroke: Stroke) {
    if (this.phase !== "drawing") return;
    if (conn.id !== this.getCurrentDrawerId()) return;

    this.strokes.push(stroke);
    // Broadcast to everyone except the drawer
    this.broadcastExcept(conn.id, { type: "draw-stroke", stroke });
  }

  private handleClearCanvas(conn: Connection) {
    if (this.phase !== "drawing") return;
    if (conn.id !== this.getCurrentDrawerId()) return;

    this.strokes = [];
    this.broadcastExcept(conn.id, { type: "clear-canvas" });
  }

  private handleGuess(conn: Connection, text: string) {
    if (this.phase !== "drawing") return;
    const drawerId = this.getCurrentDrawerId();
    if (conn.id === drawerId) return;
    if (this.correctGuessers.has(conn.id)) return;

    const player = this.players.get(conn.id);
    if (!player) return;

    const guess = text.trim().toLowerCase();
    const answer = this.currentWord?.toLowerCase() ?? "";

    if (guess === answer) {
      // Correct guess
      this.correctGuessers.add(conn.id);
      player.hasGuessedCorrectly = true;

      // Score: based on time remaining
      const timeBonus = Math.round((this.timeLeft / this.settings.drawTime) * 100);
      const guessScore = 50 + timeBonus;
      player.score += guessScore;

      // Drawer gets points too
      const drawer = this.players.get(drawerId!);
      if (drawer) {
        drawer.score += 25;
      }

      this.broadcast({
        type: "correct-guess",
        playerId: conn.id,
        playerName: player.name,
      });

      // Check if all non-drawers have guessed
      const nonDrawers = Array.from(this.players.keys()).filter(
        (id) => id !== drawerId
      );
      const allGuessed = nonDrawers.every((id) =>
        this.correctGuessers.has(id)
      );
      if (allGuessed) {
        this.endTurn();
      }
    } else {
      // Wrong guess — show as chat message
      this.broadcast({
        type: "chat-message",
        playerId: conn.id,
        playerName: player.name,
        text,
      });
    }
  }

  private handleChat(conn: Connection, text: string) {
    const player = this.players.get(conn.id);
    if (!player) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    this.broadcast({
      type: "chat-message",
      playerId: conn.id,
      playerName: player.name,
      text: trimmed,
    });
  }

  // --- Game Flow ---

  private startPickingPhase() {
    this.phase = "picking";
    this.strokes = [];
    this.currentWord = null;
    this.hintString = null;
    this.hintsRevealed = 0;
    this.correctGuessers.clear();

    // Reset hasGuessedCorrectly for all players
    for (const player of this.players.values()) {
      player.hasGuessedCorrectly = false;
    }

    const drawerId = this.getCurrentDrawerId();
    if (!drawerId) return;

    const words = this.pickRandomWords(this.settings.wordCount);

    // Broadcast phase change first, then send word choices to drawer
    this.broadcastPhaseChange();

    const drawerConn = this.room.getConnection(drawerId);
    if (drawerConn) {
      drawerConn.send(JSON.stringify({ type: "pick-words", words } as ServerMessage));
    }

    // Auto-pick timeout (15s to pick a word)
    this.startTimer(15, () => {
      if (this.phase === "picking") {
        // Auto-pick first word
        this.currentWord = words[0];
        this.hintString = this.generateHint(words[0], 0);
        this.startDrawingPhase();
      }
    });
  }

  private startDrawingPhase() {
    this.phase = "drawing";
    this.broadcastPhaseChange();

    // Start the drawing timer
    this.startTimer(this.settings.drawTime, () => {
      this.endTurn();
    });

    // Schedule hints
    if (this.settings.hints > 0 && this.currentWord) {
      this.scheduleHints();
    }
  }

  private endTurn() {
    this.stopTimer();
    this.phase = "roundEnd";

    const scores: Record<string, number> = {};
    for (const [id, player] of this.players) {
      scores[id] = player.score;
    }

    this.broadcast({
      type: "round-end",
      word: this.currentWord ?? "???",
      scores,
    });

    // Wait 5 seconds then advance
    setTimeout(() => {
      this.advanceTurn();
    }, 5000);
  }

  private advanceTurn() {
    this.turnIndex++;

    // If all players in this round have drawn
    if (this.turnIndex >= this.turnOrder.length) {
      this.round++;
      this.turnIndex = 0;

      // If all rounds are done
      if (this.round > this.settings.rounds) {
        this.endGame();
        return;
      }

      // Reshuffle turn order for next round
      this.shuffleArray(this.turnOrder);
    }

    // Check if the next drawer is still connected
    const nextDrawer = this.getCurrentDrawerId();
    if (nextDrawer && !this.players.has(nextDrawer)) {
      this.advanceTurn();
      return;
    }

    this.startPickingPhase();
  }

  private endGame() {
    this.phase = "gameEnd";
    this.stopTimer();

    const scores: Record<string, number> = {};
    for (const [id, player] of this.players) {
      scores[id] = player.score;
    }

    this.broadcast({ type: "game-end", scores });

    // Return to lobby after 10 seconds
    setTimeout(() => {
      this.phase = "lobby";
      this.round = 0;
      for (const player of this.players.values()) {
        player.score = 0;
        player.hasGuessedCorrectly = false;
      }
      this.broadcastPhaseChange();
    }, 10000);
  }

  // --- GeoGuess Flow ---

  private handleGeoGuess(conn: Connection, position: LatLng) {
    if (this.phase !== "geoGuessing") return;
    if (this.geoGuesses.has(conn.id)) return; // already guessed

    this.geoGuesses.set(conn.id, position);
    this.broadcast({ type: "player-guessed", playerId: conn.id });

    // Check if all players have guessed
    const allGuessed = Array.from(this.players.keys()).every((id) =>
      this.geoGuesses.has(id)
    );
    if (allGuessed) {
      this.endGeoRound();
    }
  }

  private startGeoGame() {
    // Prepare a shuffled pool of locations for all rounds
    this.geoLocationPool = [...GEO_LOCATIONS];
    this.shuffleArray(this.geoLocationPool);

    this.phase = "geoGuessing";
    this.broadcast({ type: "game-started", game: this.getGameStateFor(null) });
    this.startGeoRound();
  }

  private startGeoRound() {
    this.phase = "geoGuessing";
    this.geoGuesses.clear();

    // Pick next location from pool
    if (this.geoLocationPool.length === 0) {
      // Reshuffle if we run out
      this.geoLocationPool = [...GEO_LOCATIONS];
      this.shuffleArray(this.geoLocationPool);
    }
    this.currentGeoLocation = this.geoLocationPool.pop()!;

    this.broadcastPhaseChange();

    // Start timer
    this.startTimer(this.settings.geoTime, () => {
      this.endGeoRound();
    });
  }

  private endGeoRound() {
    this.stopTimer();

    if (!this.currentGeoLocation) return;

    const location = this.currentGeoLocation;
    const results: GeoGuessResult[] = [];

    for (const [id, player] of this.players) {
      const guess = this.geoGuesses.get(id);
      let distance: number;
      let points: number;

      if (guess) {
        distance = this.haversineDistance(guess, location.position);
        points = Math.round(5000 * Math.exp(-distance / 2000));
      } else {
        // No guess = 0 points, max distance
        distance = 20000;
        points = 0;
      }

      player.score += points;
      results.push({
        playerId: id,
        playerName: player.name,
        guess: guess ?? { lat: 0, lng: 0 },
        distance,
        points,
      });
    }

    // Sort by points descending
    results.sort((a, b) => b.points - a.points);

    const scores: Record<string, number> = {};
    for (const [id, player] of this.players) {
      scores[id] = player.score;
    }

    this.phase = "geoResults";
    this.broadcast({
      type: "geo-round-results",
      results,
      location,
      scores,
    });

    // After 8 seconds, advance to next round or end game
    setTimeout(() => {
      this.round++;
      if (this.round > this.settings.rounds) {
        this.endGame();
      } else {
        this.startGeoRound();
      }
    }, 8000);
  }

  private haversineDistance(a: LatLng, b: LatLng): number {
    const R = 6371; // Earth radius in km
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h =
      sinLat * sinLat +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  // --- Helpers ---

  private getCurrentDrawerId(): string | null {
    return this.turnOrder[this.turnIndex] ?? null;
  }

  private getGameStateFor(connectionId: string | null): GameState {
    const drawerId = this.getCurrentDrawerId();
    const isDrawer = connectionId === drawerId;

    return {
      phase: this.phase,
      currentDrawer: drawerId,
      currentWord: isDrawer ? this.currentWord : null,
      wordLength: this.currentWord?.length ?? null,
      hint: this.hintString,
      timeLeft: this.timeLeft,
      round: this.round,
      totalRounds: this.settings.rounds,
      scores: Object.fromEntries(
        Array.from(this.players.entries()).map(([id, p]) => [id, p.score])
      ),
      strokes: this.strokes,
      // GeoGuess fields
      geoLocation: this.currentGeoLocation
        ? { lat: this.currentGeoLocation.position.lat, lng: this.currentGeoLocation.position.lng, heading: this.currentGeoLocation.heading }
        : null,
      geoGuesses: [],
      geoLocationName: null, // only revealed in results
    };
  }

  private broadcastPhaseChange() {
    // Send personalized game state to each player (drawer sees the word)
    for (const conn of this.room.getConnections()) {
      const msg: ServerMessage = {
        type: "phase-change",
        game: this.getGameStateFor(conn.id),
      };
      conn.send(JSON.stringify(msg));
    }
  }

  private startTimer(seconds: number, onEnd: () => void) {
    this.stopTimer();
    this.timeLeft = seconds;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.broadcast({ type: "timer-tick", timeLeft: this.timeLeft });

      if (this.timeLeft <= 0) {
        this.stopTimer();
        onEnd();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private scheduleHints() {
    if (!this.currentWord || this.settings.hints === 0) return;

    const word = this.currentWord;
    const letterIndices = word
      .split("")
      .map((ch, i) => (ch !== " " ? i : -1))
      .filter((i) => i !== -1);

    const hintInterval = Math.floor(
      this.settings.drawTime / (this.settings.hints + 1)
    );

    for (let h = 1; h <= this.settings.hints; h++) {
      setTimeout(() => {
        if (this.phase !== "drawing" || this.currentWord !== word) return;

        this.hintsRevealed = h;
        // Reveal h random letters
        const shuffledIndices = [...letterIndices];
        this.shuffleArray(shuffledIndices);
        const revealCount = Math.min(h, shuffledIndices.length);
        const revealed = shuffledIndices.slice(0, revealCount);

        this.hintString = this.generateHint(word, 0, revealed);
        this.broadcast({ type: "hint-update", hint: this.hintString });
      }, hintInterval * h * 1000);
    }
  }

  private generateHint(
    word: string,
    _revealCount: number,
    revealedIndices: number[] = []
  ): string {
    return word
      .split("")
      .map((ch, i) => {
        if (ch === " ") return "  ";
        if (revealedIndices.includes(i)) return ch;
        return "_";
      })
      .join(" ");
  }

  private pickRandomWords(count: number): string[] {
    const shuffled = [...WORDS_EN];
    this.shuffleArray(shuffled);
    return shuffled.slice(0, count);
  }

  private shuffleArray<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  private broadcast(message: ServerMessage) {
    this.room.broadcast(JSON.stringify(message));
  }

  private broadcastExcept(excludeId: string, message: ServerMessage) {
    const data = JSON.stringify(message);
    for (const conn of this.room.getConnections()) {
      if (conn.id !== excludeId) {
        conn.send(data);
      }
    }
  }
}
