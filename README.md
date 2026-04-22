# 🎮 Zarena

<p align="center">
  <img src="https://img.shields.io/badge/Live-zarena.vercel.app-22c55e?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-7c3aed?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=111827" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PartyKit-Realtime_WebSockets-ff6b6b?style=for-the-badge" alt="PartyKit" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Web_Audio_API-Sounds-f59e0b?style=for-the-badge" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/Google-Street_View-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Street View" />
</p>

<p align="center">
  <b>Zarena is a cozy multiplayer party-games hub. 🎉<br/>
  No sign-up. Share a code. Play instantly with friends.</b>
</p>

---

## 🕹️ Games

### 🎨 Draw & Guess
> One player draws, everyone else guesses — the faster you guess, the more points you score!

- ✏️ Smooth bezier canvas with **4 tools** — Pen, Eraser, Flood Fill 🪣, and Line 📏
- 🎨 18-color palette + 5 brush sizes + custom cursor preview
- ↩️ Undo (button or **Ctrl+Z**) for the drawer
- 📝 **500+ curated drawable words** across 10 categories (Animals, Food, Nature, Fantasy, Brands…)
- 📂 **Category filter** — host picks which word categories to use
- ✏️ **Custom words** — host can paste their own word list
- 🃏 Word picker shows blank pattern and category badge
- 💡 Progressive letter hints with satisfying **pop animations**
- 🔥 **"So close!"** private toast when your guess is just 1–2 letters off
- 🎉 **"Everyone got it!"** celebration when the last guesser finishes
- 🔒 Correct guessers can whisper to each other privately
- 🖼️ **Round end canvas preview** of the finished drawing alongside score deltas
- 👁️ Drawer sees live **X/Y guessed** counter in the top bar
- 🏆 Rank movement arrows (↑↓) between rounds
- 🔄 Rematch button — host can restart without leaving

---

### 🌍 GeoGuess
> A random Google Street View drops you somewhere in the world — pin the map to guess where you are!

- 📍 **120+ curated city locations** spanning all 7 continents
- 🛣️ Street View always shows navigable road-level imagery (no random photospheres)
- 🗺️ **Leaflet world map** for placing your guess pin
- ⛶ **Expand map** button on mobile for easier pinning
- 💡 **Progressive geo hints** — continent at 33% time, country at 66%
- 📏 Haversine distance scoring — closer = more points (max 5,000 per round)
- 🗺️ **Results map** shows every player's pin + dashed lines to the real location
- 📊 Distance and score breakdown for every player after each round

---

## ✨ Platform Features

| Feature | Details |
|---|---|
| 🔑 Room codes | 6-character shareable codes |
| 🦊 Player names | Random fun names or type your own |
| 👑 Host controls | Start, end, rematch, kick players |
| 🔌 Connection lost | Auto-reconnect UI when socket drops |
| 🔊 Sound effects | Web Audio API tones — no external files |
| 🎊 Confetti | Canvas confetti burst on game end |
| 📱 Responsive | Works on mobile, tablet, and desktop |
| 🌐 No sign-up | Just share the link and play |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| ⚡ Framework | [Next.js 15](https://nextjs.org/) App Router |
| ⚛️ UI | [React 19](https://react.dev/) |
| 📝 Language | TypeScript 5 |
| 🎨 Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| 🎈 Realtime | [PartyKit](https://www.partykit.io/) WebSocket rooms |
| 🗺️ Maps | [Leaflet](https://leafletjs.com/) + CartoDB dark tiles |
| 📷 Street View | Google Maps Embed API (free tier, iframe) |
| 🔊 Audio | Web Audio API (programmatic tones) |
| ▲ Hosting | [Vercel](https://vercel.com/) (frontend) + PartyKit (server) |

---

## 🛠️ Getting Started

### ✅ Prerequisites

- 🟢 Node.js 18+
- 📦 npm
- 🗺️ Google Maps API key (for GeoGuess Street View)

### 📦 Install

```bash
npm install
cp .env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
```

### 🏃 Run Locally

Open two terminals:

```bash
# Terminal 1 — Next.js app
npm run dev:next

# Terminal 2 — PartyKit server
npm run dev:party
```

Or use the combined script (Linux/Mac):

```bash
npm run dev
```

> 🪟 On Windows, the two separate commands are safer than the combined script.

Open:
- 🌐 **Next.js app:** `http://localhost:3000`
- 🎈 **PartyKit server:** `http://localhost:1999`

---

## 📜 Scripts

```bash
npm run dev         # 🎮 Run Next.js + PartyKit together
npm run dev:next    # 🌐 Next.js only
npm run dev:party   # 🎈 PartyKit only
npm run build       # 🏗️ Production build
npm run start       # 🚀 Start production server
npm run lint        # 🔍 ESLint
```

---

## 📁 Project Structure

```text
zarena/
├── party/
│   └── room.ts              # 🎈 PartyKit server — all game logic lives here
├── src/
│   ├── app/
│   │   ├── page.tsx         # 🏠 Homepage — create/join room flow
│   │   ├── globals.css      # 🎨 Design system, animations, CSS tokens
│   │   └── room/[code]/
│   │       └── page.tsx     # 🎲 Realtime room — all game phases rendered here
│   ├── components/
│   │   ├── Canvas.tsx       # ✏️ Drawing canvas — tools, fill, line, cursor preview
│   │   ├── ChatBox.tsx      # 💬 Chat + guess input with whisper support
│   │   ├── Confetti.tsx     # 🎊 Canvas confetti animation
│   │   ├── DrawLobby.tsx    # 🎨 Draw & Guess lobby + settings + word categories
│   │   ├── DrawRoundEnd.tsx # 🖼️ Round end — canvas preview + score deltas
│   │   ├── GeoGuessMap.tsx  # 🗺️ Leaflet guess map with expand toggle
│   │   ├── GeoLobby.tsx     # 🌍 GeoGuess lobby + settings
│   │   ├── GeoResults.tsx   # 📊 GeoGuess round results with all-player pins map
│   │   ├── GeoStreetView.tsx# 📷 Google Street View iframe embed
│   │   ├── Lobby.tsx        # 🏠 Game-mode hub
│   │   ├── Scoreboard.tsx   # 🏆 Live scoreboard sidebar
│   │   └── WordPicker.tsx   # 📝 Word selection with blank preview + category
│   └── lib/
│       ├── canvas.ts        # 🖌️ Shared drawStroke + floodFill utilities
│       ├── locations.ts     # 📍 120+ curated GeoGuess city locations
│       ├── names.ts         # 🦊 Random player name generator
│       ├── sounds.ts        # 🔊 Web Audio API sound effects
│       ├── types.ts         # 📐 Shared TypeScript types
│       └── words.ts         # 📚 500+ drawable words in 10 categories
├── partykit.json            # 🎈 PartyKit config
├── .env.example             # 🔐 Environment variable template
├── RELEASE.md               # 🗺️ Release notes and roadmap
└── README.md
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_PARTYKIT_HOST` | 🎈 PartyKit server host | `localhost:1999` locally |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | 🗺️ Google Maps API key for Street View | Yes for GeoGuess |

---

## 🧪 Manual Playtest Checklist

1. 🚦 Start both dev servers
2. 🌐 Open `http://localhost:3000`
3. 🏠 Create a room in Tab A
4. 🔑 Join the same room from Tab B (different browser or incognito)
5. 🎨 Play **Draw & Guess** — test drawing tools, guessing, hints, round end, rematch
6. 🌍 Play **GeoGuess** — test Street View, map pin, hints, results, multi-round scoring
7. 🔌 Close one tab mid-game and confirm the other handles the disconnect gracefully

---

## 🚢 Deployment

Zarena has two separate deploy targets:

### 1. 🎈 Deploy the PartyKit server

```bash
npx partykit login
npx partykit deploy
```

### 2. ▲ Deploy the Next.js app to Vercel

Set these environment variables in your Vercel project:

```env
NEXT_PUBLIC_PARTYKIT_HOST=your-partykit-project.username.partykit.dev
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

> ⚠️ Always deploy PartyKit **before** Vercel so the server is live when the frontend connects.

---

## 📄 License

MIT — feel free to fork, remix, and build on top of Zarena. 🎉
