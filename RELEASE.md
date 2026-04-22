# 🗺️ Zarena — Release Notes & Roadmap

🌐 **Live:** [zarena.vercel.app](https://zarena.vercel.app/)

---

## 🚀 v1.0 — Playable Party Games Baseline ✅

> First public release. The foundation is live and playable.

### 🧱 Platform

- [x] ⚡ Next.js 15 App Router + TypeScript + Tailwind CSS v4
- [x] 🎈 PartyKit realtime WebSocket room server
- [x] 🏠 Create-room and join-room flow
- [x] 🔑 Shareable 6-character room codes
- [x] 🦊 Random fun player names + editable before joining
- [x] 🛰️ Realtime player join/leave tracking
- [x] 👑 Host detection and host-only controls
- [x] ⚙️ Room settings synced through PartyKit
- [x] 🕹️ Game-mode selection hub (Draw & Guess / GeoGuess)
- [x] 🚢 Deployable on Vercel + PartyKit
- [x] 🌐 Live deployment at zarena.vercel.app

### 🎨 Draw & Guess

- [x] 🎬 Game phases: lobby → word pick → drawing → round end → game end
- [x] 🖌️ Canvas drawing with realtime stroke sync
- [x] 🧽 Clear canvas
- [x] 💬 Chat and guess input
- [x] ✅ Correct-guess detection
- [x] ⏱️ Round timer
- [x] 💡 Progressive letter hints
- [x] 🧮 Time-based scoring with drawer bonus
- [x] 🏆 Scoreboard and end-of-game leaderboard
- [x] 🛑 Host can end an active game early

### 🌍 GeoGuess

- [x] 🌐 GeoGuess lobby and settings
- [x] 🎲 Random world location generation
- [x] 🛣️ Google Street View display
- [x] 📍 Interactive Leaflet map guessing
- [x] 📏 Haversine distance scoring (max 5,000 pts)
- [x] 🧭 Round results with location reveal
- [x] 🏆 Shared cumulative scoreboard

---

## ✨ v1.1 — Polish & Release Readiness ✅

> Stability, UX, and multiplayer resilience improvements.

### 🔧 Resilience

- [x] 🔌 Connection lost UI with animated reconnect indicator
- [x] 🔄 Disconnect handling — host migration, drawer disconnect auto-advances turn
- [x] 🧩 Late-join sync — new players receive full game state on connect
- [x] 🔀 Picking phase disconnect — auto-skips if drawer leaves during word selection

### 🎨 Draw & Guess Polish

- [x] 🖊️ Smooth bezier drawing (quadraticCurveTo through midpoints)
- [x] 📚 500+ curated drawable words in 10 categories
- [x] 📂 Word category filter — host picks which categories to use
- [x] ✏️ Custom words — host can paste their own list
- [x] 🔒 Correct-guesser private chat (whisper) — visible only to drawer + other correct guessers
- [x] 🖼️ Canvas preview on round end screen alongside score deltas
- [x] 🏅 Rank movement arrows (↑↓) in round results
- [x] 🔄 Rematch button — host restarts without leaving

### 🌍 GeoGuess Polish

- [x] 📍 120+ curated city-centre locations across all continents
- [x] 🛣️ `source=outdoor` + `radius=1500m` ensures navigable street-level views
- [x] 💡 Progressive geo hints — continent (33% elapsed) → country (66% elapsed)
- [x] 📊 Results map shows every player's pin + dashed line to real location
- [x] ⛶ Expand-map button on mobile for full-screen pin placement

### 🔊 Sound Effects

- [x] 🎉 Correct guess — ascending happy chord
- [x] ⏰ Round end — descending resolve
- [x] 🏆 Game end — victory fanfare
- [x] 🎮 Game start — upward sweep
- [x] ⏱️ Urgent timer tick (last 10 seconds)
- [x] 💡 Hint revealed — two-note chime

### 👑 Host Tools

- [x] 🦵 Kick player — host can remove AFK players from lobby or game
- [x] ✕ End game early button
- [x] 🔄 Rematch from game end screen

### 🎊 Celebration

- [x] 🎊 Canvas confetti burst on game end (180 pieces, 5 seconds, gravity + fade)
- [x] 🎉 "You got it!" personal flash when you guess correctly
- [x] 🔥 "So close!" private toast when your guess is 1–2 letters off (Levenshtein)
- [x] ✅ "Everyone got it!" chat message when all non-drawers guess correctly

---

## 🎨 v1.2 — Drawing Tools Deep Dive ✅

> Professional-grade drawing tools that make the game feel great.

- [x] ✏️ **Pen tool** — smooth bezier strokes with pressure feel
- [x] 🧹 **Eraser tool** — white brush with eraser cursor
- [x] 🪣 **Flood fill tool** — BFS flood fill with 30-unit tolerance for anti-aliased edges; replicated to all clients and stored in stroke history
- [x] 📏 **Line tool** — click + drag with live preview on overlay canvas; commits straight 2-point stroke on release
- [x] 👁️ **Cursor preview** — circle follows mouse, sized and colored to match current brush
- [x] ↩️ **Undo** — removes last stroke (button + Ctrl+Z / Cmd+Z); synced to all clients
- [x] 🎨 18-color palette (expanded from 15)
- [x] 🃏 **Word picker polish** — each word shows blank pattern (`_ _ _ _ _`) + category badge
- [x] 💡 **Hint letter animation** — revealed letters pop in with spring bounce (`animate-pop`)
- [x] 👀 **Drawer guess counter** — top bar shows `X/Y guessed` live for the drawer

---

## 🔮 Roadmap — Future Ideas

> Things that would make Zarena even better. No timeline, just ideas.

### 🎮 Gameplay

- [ ] 👀 Spectator mode — watch without playing
- [ ] 🎞️ Drawing replay / timelapse after round end
- [ ] 📜 Round history — see previous words in the session
- [ ] 🌡️ Difficulty presets — Easy / Normal / Hard (word pools + time)
- [ ] ⚡ Sudden death mode — one guess limit per player

### 🎨 Draw & Guess

- [ ] 📝 Text tool — add text labels to drawings
- [ ] 🖼️ Image stamp tool — basic shapes (circle, square, arrow)
- [ ] 📜 Canvas layers — separate background and foreground
- [ ] 🔁 Rotate / flip canvas

### 🌍 GeoGuess

- [ ] 🌎 Region lock — play only cities from a specific continent or country
- [ ] 🏙️ City-only mode vs. countryside mode
- [ ] 🗺️ Show heading/bearing hint after 80% of time
- [ ] 📡 Multiplayer Street View navigation — everyone explores together

### 🏘️ Social

- [ ] 🏘️ Public room browser — browse open rooms without a code
- [ ] 🎲 Party queue — rotate game modes automatically
- [ ] 🧩 Additional games beyond Draw & Guess and GeoGuess
- [ ] 🏆 Persistent leaderboard across sessions
- [ ] 🌓 Dark / light mode toggle
- [ ] 🧑‍🎨 Player avatar customization

---

*Last updated: April 2026 🗓️*
