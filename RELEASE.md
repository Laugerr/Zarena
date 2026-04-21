# 🗺️ Zarena Release Plan

## 🎉 v1.0 - Playable Party Games Baseline

This is the current first public baseline for Zarena: a playable multiplayer party-games website with room creation, realtime lobbies, Draw & Guess, and an early GeoGuess mode. ✨

🌐 Live website: [zarena.vercel.app](https://zarena.vercel.app/)

### 🧱 Core Platform

- [x] ⚡ Next.js app with TypeScript and Tailwind CSS
- [x] 🎈 PartyKit realtime room server
- [x] 🏠 Create-room and join-room flow
- [x] 🔑 Shareable 6-character room codes
- [x] 🦊 Random player names with editable names before entering a room
- [x] 🛰️ Realtime player join/leave tracking
- [x] 👑 Host detection and host-only game controls
- [x] ⚙️ Room settings synced through the PartyKit server
- [x] 🚢 Deployable frontend/server structure for Vercel + PartyKit
- [x] 🌐 Live Vercel deployment

### 🎨 Draw & Guess

- [x] 🎬 Game phases: lobby, word picking, drawing, round end, and game end
- [x] 📝 Word selection for the drawer
- [x] 🖌️ Canvas drawing with realtime stroke sync
- [x] 🧽 Clear-canvas support
- [x] 💬 Chat and guess input
- [x] ✅ Correct-guess detection
- [x] ⏱️ Round timer
- [x] 💡 Progressive word hints
- [x] 🧮 Per-player scoring
- [x] 🎁 Drawer bonus points
- [x] 🏆 Scoreboard and end-of-game leaderboard
- [x] 🛑 Host can end an active game early

### 🌍 GeoGuess

- [x] 🌐 GeoGuess lobby and settings
- [x] 🎲 Random weighted world-location generation
- [x] 🛣️ Google Street View display
- [x] 📍 Interactive map guessing
- [x] 📏 Distance-based scoring
- [x] 🧭 Round results with location reveal
- [x] 🏆 Shared scoreboard across rounds

### ✨ UX

- [x] 🕹️ Game-mode selection hub
- [x] 📱 Responsive room/game layout
- [x] 💬 Mobile chat area for Draw & Guess
- [x] 🎭 Animated and themed interface
- [x] ⚠️ Basic error handling for room joining

## 🧪 v1.1 - Stability & Documentation

- [ ] 🔍 Verify the app with `npm run lint`
- [ ] 🏗️ Verify production build with `npm run build`
- [ ] 🧑‍🤝‍🧑 Add local testing notes for two-browser multiplayer checks
- [ ] 🚢 Add deployment checklist for Vercel and PartyKit
- [ ] 🔐 Confirm environment variable setup for production
- [ ] 🖼️ Improve README screenshots or demo GIFs
- [ ] 🐛 Fix any browser-specific issues found during manual playtesting

## 🎨 v1.2 - Draw & Guess Polish

- [ ] 🌈 Brush color picker improvements
- [ ] 🖌️ Brush size controls
- [ ] 🧽 Eraser tool
- [ ] ⚡ Better drawing performance for long rounds
- [ ] 📜 Round history showing previous words
- [ ] 🔊 Sound effects for correct guesses, timer warnings, and round end
- [ ] 👀 Better spectator/waiting states when joining mid-game
- [ ] 🧹 More robust anti-duplicate player handling

## 🌍 v1.3 - GeoGuess Polish

- [ ] 🛣️ Validate Street View availability before starting a round
- [ ] 🧯 Better fallback UI when Google Maps is missing or unavailable
- [ ] 🗺️ More accurate location pools and categories
- [ ] 📍 Guess markers for all players on results map
- [ ] 📏 Distance visualization between guess and answer
- [ ] 🌎 Optional region-based game settings

## 🤝 v1.4 - Social & Room Settings

- [ ] 🔗 Invite link/share button
- [ ] 🚪 Max-player enforcement
- [ ] ⚙️ More detailed room settings
- [ ] ⏱️ Custom round count and timers per mode
- [ ] 🧑‍🎨 Player avatars or color indicators
- [ ] 🌓 Dark/light mode toggle
- [ ] 🎞️ Animated transitions between phases

## 🔮 Future Ideas

- [ ] 📚 Custom word packs and categories
- [ ] 👀 Spectator mode
- [ ] 🎞️ Drawing replay/timelapse
- [ ] 🏘️ Public room browser
- [ ] 🎲 Party queue for rotating game modes
- [ ] 🧩 Additional party games beyond Draw & Guess and GeoGuess
