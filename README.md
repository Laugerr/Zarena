# 🎮 Zarena

[![Live Demo](https://img.shields.io/badge/Live-Demo-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://zarena.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=111827)](https://react.dev/)
[![PartyKit](https://img.shields.io/badge/PartyKit-Realtime-ff6b6b?style=for-the-badge)](https://www.partykit.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

Zarena is a cozy multiplayer party-games website. Create a room, share the code, and play quick browser games with friends without sign-up. ✨

<p>
  <a href="https://zarena.vercel.app/">
    <img src="https://img.shields.io/badge/🚀%20Play%20Zarena-Live%20Website-8b5cf6?style=for-the-badge" alt="Play Zarena live website" />
  </a>
</p>

## 🚀 Current Release

The current baseline is a playable Zarena website with:

- 🌐 Live website: [`zarena.vercel.app`](https://zarena.vercel.app/)
- 🛰️ Realtime multiplayer rooms powered by PartyKit
- 🔑 Room creation and 6-character join codes
- 🦊 Random or custom player names
- 🕹️ A game-mode hub
- 🎨 Draw & Guess with canvas drawing, word picking, chat guesses, timers, hints, scoring, and leaderboards
- 🌍 GeoGuess with Street View, map guessing, distance scoring, and round results

See [RELEASE.md](./RELEASE.md) for the current release state and roadmap. 🗺️

## 🧰 Tech Stack

- ⚡ Next.js 16 App Router
- ⚛️ React 19
- 📝 TypeScript
- 🎨 Tailwind CSS v4
- 🎈 PartyKit for realtime WebSocket rooms
- 🗺️ Google Maps / Street View for GeoGuess
- ▲ Vercel for frontend deployment

## 🛠️ Getting Started

### ✅ Prerequisites

- 🟢 Node.js 18+
- 📦 npm
- 🗺️ Google Maps API key if you want to use GeoGuess Street View

### 📦 Setup

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

Run the Next.js app and PartyKit server in separate terminals:

```bash
npm run dev:next
```

```bash
npm run dev:party
```

Then open:

- 🌐 Next.js app: `http://localhost:3000`
- 🎈 PartyKit server: `http://localhost:1999`

There is also a combined script:

```bash
npm run dev
```

On Windows, running the two separate commands is usually safer because the combined script uses shell process syntax. 🪟

## 📜 Scripts

```bash
npm run dev        # 🎮 Run Next.js and PartyKit together
npm run dev:next   # 🌐 Run only the Next.js app
npm run dev:party  # 🎈 Run only the PartyKit server
npm run build      # 🏗️ Build the Next.js app
npm run start      # 🚀 Start the production Next.js server
npm run lint       # 🔍 Run ESLint
```

## 📁 Project Structure

```text
zarena/
|-- party/
|   `-- room.ts              # 🎈 PartyKit room server and game logic
|-- src/
|   |-- app/
|   |   |-- page.tsx         # 🏠 Homepage and create/join flow
|   |   `-- room/[code]/
|   |       `-- page.tsx     # 🎲 Realtime room and game UI
|   |-- components/          # 🧩 Lobby, canvas, chat, GeoGuess, and game UI
|   `-- lib/                 # 🧠 Shared types, words, names, room codes, locations
|-- partykit.json            # 🎈 PartyKit configuration
|-- .env.example             # 🔐 Environment variable template
|-- RELEASE.md               # 🗺️ Current release state and roadmap
`-- README.md
```

## 🔐 Environment Variables

| Variable | Description | Local default |
| --- | --- | --- |
| `NEXT_PUBLIC_PARTYKIT_HOST` | 🎈 PartyKit server host used by the browser client | `localhost:1999` |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | 🗺️ Google Maps browser API key for GeoGuess Street View and maps | Required for GeoGuess |

## 🧪 Manual Playtest

1. 🚦 Start both dev servers.
2. 🌐 Open `http://localhost:3000`.
3. 🏠 Create a room in one browser tab.
4. 🔑 Join the same room from another tab or browser.
5. 🎨 Start Draw & Guess and confirm drawing, guessing, scoring, and round transitions work.
6. 🌍 Start GeoGuess and confirm Street View, map guessing, scoring, and results work.

## 🚢 Deployment

Zarena uses two deploy targets:

1. 🎈 Deploy the PartyKit server:

```bash
npx partykit login
npx partykit deploy
```

2. ▲ Deploy the Next.js app to Vercel.

Set these production environment variables in Vercel:

```env
NEXT_PUBLIC_PARTYKIT_HOST=your-partykit-host
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-api-key
```

## 📄 License

MIT
