# 🎮 Zarena

> A cozy multiplayer party-games hub. Create a room, share the code, play with friends — no sign-up needed. ✨

## 🚀 Tech Stack

- ⚡ **Next.js 15** (App Router) + TypeScript
- 🎨 **Tailwind CSS v4** for styling
- 🎈 **PartyKit** for realtime multiplayer (WebSocket rooms)
- ▲ **Vercel** (frontend) + **PartyKit** (game server)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Run both Next.js and PartyKit dev servers
npm run dev
```

This starts:
- 🌐 Next.js on `http://localhost:3000`
- 🎈 PartyKit on `http://localhost:1999`

### Running Separately

```bash
# Terminal 1: Next.js
npm run dev:next

# Terminal 2: PartyKit
npm run dev:party
```

## 📁 Project Structure

```
zarena/
├── party/
│   └── room.ts              # 🎈 PartyKit server (realtime room logic)
├── src/
│   ├── app/
│   │   ├── page.tsx         # 🏠 Homepage (create/join room)
│   │   └── room/
│   │       └── [code]/
│   │           └── page.tsx # 🎲 Room page (WebSocket connection)
│   └── lib/
│       ├── types.ts         # 📝 Shared message types (client ↔ server)
│       ├── names.ts         # 🦊 Random player name generator
│       └── room-code.ts     # 🔑 Room code generation & validation
├── partykit.json            # 🎈 PartyKit config
└── .env.example             # 🔒 Environment variables template
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_PARTYKIT_HOST` | PartyKit server URL | `localhost:1999` |

## 🚢 Deployment

**Two separate deploys:**

1. **PartyKit** → `npx partykit login && npx partykit deploy`
2. **Vercel** → Push to GitHub, connect repo, set `NEXT_PUBLIC_PARTYKIT_HOST` to your PartyKit URL

## 📜 License

MIT
