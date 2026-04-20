# 🗺️ Zarena Release Plan

## ✅ v0.1 — Lobby & Rooms (current)

- [x] Project scaffolding (Next.js 15, Tailwind, TypeScript)
- [x] PartyKit server with connect/disconnect tracking
- [x] Homepage with Create Room & Join Room flows
- [x] 6-char room codes (client-generated)
- [x] Room page with live player count & names
- [x] Random player names (adjective + animal)
- [x] Typed message schema (discriminated unions)
- [x] Deploy to Vercel + PartyKit

## 🎨 v0.2 — Draw & Guess (core game)

- [ ] Game phases: lobby → picking → drawing → guessing → results
- [ ] Canvas drawing with brush tools (size, color, eraser)
- [ ] Word selection (3 choices for the drawer)
- [ ] Real-time canvas sync to all players
- [ ] Chat/guess input with correct-guess detection
- [ ] Round timer with countdown
- [ ] Word hint (progressive letter reveal)

## 🏆 v0.3 — Scoring & Polish

- [ ] Point system (speed bonus, drawer bonus)
- [ ] Scoreboard between rounds
- [ ] End-of-game leaderboard
- [ ] Round history (what was drawn)
- [ ] Sound effects (correct guess, timer warning, round end)
- [ ] Player avatars or color indicators

## 💅 v0.4 — UX & Social

- [ ] Custom player names (editable before joining)
- [ ] Room settings (max players, round count, time limit)
- [ ] Invite link / share button
- [ ] Mobile-friendly canvas & responsive layout
- [ ] Dark/light mode toggle
- [ ] Animated transitions between phases

## 🌍 v0.5 — Second Game (GeoGuess)

- [ ] Map-based guessing game mode
- [ ] Google Street View or Mapillary integration
- [ ] Distance-based scoring
- [ ] Room supports switching between game modes

## 🔮 Future Ideas

- [ ] Accounts & persistent stats (optional sign-in)
- [ ] Custom word packs / categories
- [ ] Spectator mode
- [ ] Replay / timelapse of drawings
- [ ] Public room browser
- [ ] Party queue (auto-rotate game modes)
