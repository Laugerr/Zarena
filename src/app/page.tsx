"use client";

import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode, isValidRoomCode } from "@/lib/room-code";
import { generateName } from "@/lib/names";

/* ─── sprite sheet ─────────────────────────────────────────────────────────
   4 cols × 2 rows, each cell 128×128 px
   (0,0) star  (1,0) crown   (2,0) sparkle  (3,0) dots
   (0,1) target (1,1) burst  (2,1) petal    (3,1) diamond
─────────────────────────────────────────────────────────────────────────── */
function sprite(col: number, row: number, size: number): React.CSSProperties {
  const x = col === 0 ? "0%" : col === 1 ? "33.33%" : col === 2 ? "66.67%" : "100%";
  const y = row === 0 ? "0%" : "100%";
  return {
    backgroundImage: "url('/ui-assets/sprites.png')",
    backgroundSize: "400% 200%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: `${x} ${y}`,
    width: `${size}px`,
    height: `${size}px`,
    flexShrink: 0,
  };
}

/* desktop decorations — positioned across all zones */
const DECO_DESKTOP = [
  { col:0, row:0, size:52, pos:{ top:"6%",     left:"8%"   }, anim:"animate-float",      delay:"0s",   opacity:0.75 },
  { col:2, row:0, size:36, pos:{ top:"38%",    left:"4%"   }, anim:"animate-float-slow", delay:"0.8s", opacity:0.55 },
  { col:3, row:1, size:40, pos:{ bottom:"28%", left:"12%"  }, anim:"animate-float",      delay:"1.4s", opacity:0.60 },
  { col:1, row:1, size:28, pos:{ top:"20%",    left:"18%"  }, anim:"animate-float-slow", delay:"2.1s", opacity:0.40 },
  { col:1, row:0, size:38, pos:{ top:"7%",     left:"48%"  }, anim:"animate-float-slow", delay:"0.5s", opacity:0.50 },
  { col:3, row:0, size:30, pos:{ top:"55%",    left:"43%"  }, anim:"animate-float",      delay:"1.9s", opacity:0.38 },
  { col:0, row:1, size:24, pos:{ top:"30%",    left:"55%"  }, anim:"animate-float-slow", delay:"1.2s", opacity:0.30 },
  { col:2, row:1, size:32, pos:{ top:"12%",    right:"4%"  }, anim:"animate-float",      delay:"0.3s", opacity:0.48 },
  { col:3, row:1, size:38, pos:{ top:"45%",    right:"2%"  }, anim:"animate-float-slow", delay:"1.0s", opacity:0.55 },
  { col:0, row:0, size:26, pos:{ bottom:"20%", right:"8%"  }, anim:"animate-float",      delay:"1.6s", opacity:0.35 },
  { col:2, row:0, size:18, pos:{ top:"72%",    left:"32%"  }, anim:"animate-float",      delay:"0.6s", opacity:0.25 },
  { col:1, row:0, size:20, pos:{ top:"85%",    left:"60%"  }, anim:"animate-float-slow", delay:"1.8s", opacity:0.22 },
] as const;

/* mobile decorations — tighter, around the wolf */
const DECO_MOBILE = [
  { col:0, row:0, size:36, pos:{ top:"4%",  left:"4%"   }, anim:"animate-float",      delay:"0s",   opacity:0.75 },
  { col:1, row:0, size:28, pos:{ top:"6%",  right:"6%"  }, anim:"animate-float-slow", delay:"0.6s", opacity:0.65 },
  { col:2, row:0, size:22, pos:{ top:"22%", right:"3%"  }, anim:"animate-float",      delay:"1.1s", opacity:0.50 },
  { col:3, row:1, size:26, pos:{ top:"18%", left:"3%"   }, anim:"animate-float-slow", delay:"1.5s", opacity:0.45 },
  { col:1, row:1, size:20, pos:{ top:"35%", right:"8%"  }, anim:"animate-float",      delay:"0.9s", opacity:0.40 },
] as const;

/* ─── data ─────────────────────────────────────────────────────────────── */

const LIVE_ACTIVITY = [
  { user: "Luna", action: "guessed the word",  time: "2s ago",  color: "#a855f7" },
  { user: "Noah", action: "found Paris",        time: "15s ago", color: "#3b82f6" },
  { user: "Mia",  action: "won Meme Battle",    time: "1m ago",  color: "#eab308" },
  { user: "Jack", action: "joined the room",    time: "2m ago",  color: "#22c55e" },
];

const TRENDING = [
  { icon: "🎨", name: "Draw & Guess",  count: "1,245 playing", bar: 100, grad: "linear-gradient(90deg,#ec4899,#f59e0b)" },
  { icon: "🌍", name: "GeoGuess",      count: "876 playing",   bar: 70,  grad: "linear-gradient(90deg,#3b82f6,#8b5cf6)" },
  { icon: "😂", name: "Meme Battle",   count: "643 playing",   bar: 52,  grad: "linear-gradient(90deg,#eab308,#f97316)" },
];

const STATS = [
  { icon: "👥", value: "2,431",  label: "Players Online" },
  { icon: "🎮", value: "145",    label: "Active Rooms"   },
  { icon: "🎯", value: "12,540", label: "Games Played"   },
  { icon: "💜", value: "98%",    label: "Good Vibes"     },
];

const STEPS = [
  { num: "1", icon: "🎮", title: "Create or Join",  desc: "Make or enter a room"     },
  { num: "2", icon: "🎲", title: "Pick a Game",     desc: "Choose your favourite"    },
  { num: "3", icon: "🎨", title: "Play Together",   desc: "Invite your friends"      },
  { num: "4", icon: "😂", title: "Laugh & Repeat",  desc: "Make memories together"   },
];

const NAV = [
  { label: "Home",        href: "#",                             active: true,  external: false },
  { label: "How to Play", href: "#how-to-play",                  active: false, external: false },
  { label: "Leaderboard", href: "#",                             active: false, external: false },
  { label: "Discord",     href: "https://discord.gg/yWd8R9DRz6", active: false, external: true  },
];

/* ─── shared sub-components ─────────────────────────────────────────────── */

function Badge({ small = false }: { small?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 self-center rounded-full border border-white/10 font-bold uppercase tracking-[0.18em] text-white/45 ${small ? "px-3 py-1 text-[0.52rem]" : "px-4 py-1.5 text-[0.68rem]"}`}
      style={{ background: "rgba(255,255,255,0.045)" }}>
      <span className={`text-yellow-300 ${small ? "text-[0.7rem]" : "text-sm"}`}>⚡</span>
      Instant Party Games
    </div>
  );
}

function Headline({ small = false }: { small?: boolean }) {
  const size = small ? "clamp(1.65rem, 4.5vw, 3.75rem)" : "clamp(2.2rem, 5vw, 3.75rem)";
  const svgBottom = small ? "-6px" : "-8px";
  return (
    <h1 className="font-black leading-[0.92] tracking-tight text-center"
      style={{ fontSize: size }}>
      Draw, guess &amp;<br />
      laugh with{" "}
      <span className="relative inline-block whitespace-nowrap">
        <span style={{
          background: "linear-gradient(90deg,#f472b6 0%,#fb923c 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 12px rgba(244,114,182,0.6))",
        }}>
          friends
        </span>
        <svg className="absolute left-0 w-full overflow-visible pointer-events-none"
          style={{ bottom: svgBottom }} height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
          <path d="M0,6 C12,1 25,10 37,6 C50,1 63,10 75,6 C87,1 95,10 100,6"
            fill="none" strokeWidth="3" strokeLinecap="round" stroke="url(#wg)" />
          <defs>
            <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </h1>
  );
}

/* ─── component ──────────────────────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState(() => generateName());
  const [joinCode,   setJoinCode]   = useState("");
  const [showJoin,   setShowJoin]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [error,      setError]      = useState("");

  function handleCreate() {
    if (!playerName.trim()) { setError("You need a name to play!"); return; }
    const code = generateRoomCode();
    router.push(`/room/${code}?name=${encodeURIComponent(playerName.trim())}`);
  }
  function handleJoin() {
    if (!playerName.trim()) { setError("You need a name to play!"); return; }
    const code = joinCode.trim().toUpperCase();
    if (!isValidRoomCode(code)) { setError("Enter a valid 6-character room code"); return; }
    router.push(`/room/${code}?name=${encodeURIComponent(playerName.trim())}`);
  }
  function rollName() { setPlayerName(generateName()); }

  /* ── nickname card (shared between mobile & desktop) ── */
  const nicknameCard = (
    <div className="w-full rounded-2xl border border-violet-500/20 p-4 sm:p-5"
      style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(32px)",
        boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 8px 32px rgba(0,0,0,0.40)" }}>
      <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-white/40 mb-3 text-center">
        Choose your nickname
      </p>
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          value={playerName}
          onChange={(e) => { setPlayerName(e.target.value); setError(""); }}
          maxLength={16}
          placeholder="SwiftWolf"
          className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white text-center placeholder:text-white/25 focus:outline-none focus:border-violet-400/60 transition-colors"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <button onClick={rollName} title="Generate random name"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-lg transition-all hover:border-violet-400/60 hover:scale-110 hover:rotate-12 active:scale-95"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          🎲
        </button>
      </div>
    </div>
  );

  /* ── CTA buttons (shared) ── */
  const ctaButtons = (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <button onClick={handleCreate}
        className="group flex-1 flex items-center justify-center gap-3 rounded-2xl px-5 py-4 border transition-all hover:scale-[1.03] hover:brightness-[1.35] active:scale-[0.96] active:brightness-100"
        style={{ background: "rgba(236,72,153,0.12)", borderColor: "rgba(236,72,153,0.40)",
          backdropFilter: "blur(20px)", boxShadow: "0 0 0 1px rgba(236,72,153,0.12), 0 8px 32px rgba(236,72,153,0.25)" }}>
        <span className="text-3xl leading-none shrink-0 group-hover:scale-110 transition-transform">🚀</span>
        <div className="text-center">
          <p className="text-[0.9rem] font-black text-white leading-tight">Create Room</p>
          <p className="text-[0.68rem] text-white/65 leading-snug">Start a new game</p>
        </div>
      </button>
      <button onClick={() => { setShowJoin(!showJoin); setError(""); }}
        className="group flex-1 flex items-center justify-center gap-3 rounded-2xl px-5 py-4 border transition-all hover:scale-[1.03] hover:brightness-[1.35] active:scale-[0.96] active:brightness-100"
        style={{ background: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.40)",
          backdropFilter: "blur(20px)", boxShadow: "0 0 0 1px rgba(139,92,246,0.12), 0 8px 32px rgba(139,92,246,0.20)" }}>
        <span className="text-3xl leading-none shrink-0 group-hover:scale-110 transition-transform">🔗</span>
        <div className="text-center">
          <p className="text-[0.9rem] font-black text-white leading-tight">Join Room</p>
          <p className="text-[0.68rem] text-white/50 leading-snug">Enter room code</p>
        </div>
      </button>
    </div>
  );

  /* ── join code input (shared) ── */
  const joinInput = showJoin && (
    <div className="animate-slide-up flex gap-2 w-full">
      <input type="text" value={joinCode}
        onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        placeholder="ROOM CODE" maxLength={6} autoFocus
        className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center text-base font-black font-mono uppercase tracking-[0.4em] text-white placeholder:text-white/15 focus:border-violet-400/60 focus:outline-none transition-colors"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <button onClick={handleJoin}
        className="rounded-xl px-5 py-3 text-sm font-black text-white transition-all hover:scale-[1.03] active:scale-[0.97]"
        style={{ background: "linear-gradient(135deg,#06b6d4,#8b5cf6)", boxShadow: "0 4px 20px rgba(6,182,212,0.35)" }}>
        Join ✨
      </button>
    </div>
  );

  return (
    <main className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col relative"
      style={{ background: "#07040f" }}>

      {/* ══════════════════════ ATMOSPHERE ══════════════════════ */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(109,40,217,0.45) 0%, transparent 65%)" }} />
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-[35%] w-[420px] h-[340px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)" }} />
        <div className="absolute -top-20 right-[5%] w-[380px] h-[380px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />

        {/* desktop sprites */}
        {DECO_DESKTOP.map((d, i) => (
          <div key={`d-${i}`} className={`${d.anim} absolute pointer-events-none select-none hidden md:block`}
            style={{ ...d.pos, ...sprite(d.col, d.row, d.size), opacity: d.opacity, animationDelay: d.delay }} />
        ))}
        {/* mobile sprites */}
        {DECO_MOBILE.map((d, i) => (
          <div key={`m-${i}`} className={`${d.anim} absolute pointer-events-none select-none block md:hidden`}
            style={{ ...d.pos, ...sprite(d.col, d.row, d.size), opacity: d.opacity, animationDelay: d.delay }} />
        ))}
      </div>

      {/* ══════════════════════ NAVBAR ══════════════════════════ */}
      <nav className="relative z-30 shrink-0 flex items-center justify-between px-4 sm:px-8 py-2 border-b border-white/[0.06]"
        style={{ background: "rgba(7,4,15,0.85)", backdropFilter: "blur(20px)" }}>

        {/* logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-light.png" alt="Zarena" className="h-12 w-auto shrink-0 select-none" />

        {/* desktop pill nav */}
        <div className="hidden md:flex items-center gap-0.5 rounded-full border border-white/[0.07] px-1.5 py-1"
          style={{ background: "rgba(255,255,255,0.035)" }}>
          {NAV.map((item) => (
            <a key={item.label} href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={`px-4 py-1 rounded-full text-[0.72rem] font-semibold transition-all flex items-center gap-1.5 ${
                item.active ? "bg-white text-[#07040f] font-black"
                  : item.label === "Discord" ? "text-indigo-400/80 hover:text-indigo-300"
                  : "text-white/40 hover:text-white/75"
              }`}>
              {item.label === "Discord" && <span className="text-xs">💬</span>}
              {item.label}
            </a>
          ))}
        </div>

        {/* desktop: online counter + play now */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3 py-1.5"
            style={{ background: "rgba(255,255,255,0.035)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.72rem] font-semibold text-white/55">2,431 Online</span>
          </div>
          <button className="rounded-xl border border-white/10 px-4 py-1.5 text-[0.72rem] font-semibold text-white/55 hover:border-violet-400/40 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            Play Now 🎮
          </button>
        </div>

        {/* mobile: hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="flex md:hidden flex-col gap-1.5 p-2 rounded-xl border border-white/10 transition-all hover:border-white/20"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <span className={`block w-5 h-0.5 bg-white/70 rounded-full transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/70 rounded-full transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/70 rounded-full transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden relative z-30 shrink-0 border-b border-white/[0.06] animate-slide-up"
          style={{ background: "rgba(7,4,15,0.95)", backdropFilter: "blur(20px)" }}>
          {NAV.map((item) => (
            <a key={item.label} href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3.5 border-b border-white/[0.04] text-sm font-semibold transition-colors ${
                item.active ? "text-white" : item.label === "Discord" ? "text-indigo-400" : "text-white/50 hover:text-white/80"
              }`}>
              {item.label === "Discord" && <span>💬</span>}
              {item.active && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* mobile: online counter bar */}
      <div className="md:hidden relative z-20 shrink-0 flex items-center justify-center gap-2 py-2 border-b border-white/[0.04]"
        style={{ background: "rgba(255,255,255,0.02)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-white/45">2,431 Online right now</span>
      </div>

      {/* ══════════════════════ MOBILE LAYOUT ════════════════════════════════ */}
      <div className="md:hidden relative z-10 flex flex-col animate-slide-up">

        {/* ── Atmosphere: fixed positions anchored to hero zone ── */}
        <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden z-0"
          style={{ height: "580px" }}>
          {/* Core purple nebula — sits behind wolf */}
          <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ top: "130px", width: "400px", height: "400px",
              background: "radial-gradient(circle, rgba(109,40,217,0.75) 0%, rgba(109,40,217,0.28) 42%, transparent 70%)",
              filter: "blur(44px)" }} />
          {/* Warm pink/orange — near title */}
          <div className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ top: "20px", width: "260px", height: "130px",
              background: "radial-gradient(ellipse, rgba(236,72,153,0.28) 0%, rgba(251,146,60,0.10) 55%, transparent 80%)",
              filter: "blur(28px)" }} />
          {/* Indigo right */}
          <div className="absolute rounded-full"
            style={{ top: "180px", right: "-6%", width: "160px", height: "160px",
              background: "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)",
              filter: "blur(18px)" }} />
          {/* Neon particles */}
          {([
            { size: 6,  left: "14%", top: "230px", color: "rgba(167,139,250,0.90)", delay: "0s",   anim: "animate-float"      },
            { size: 4,  left: "80%", top: "185px", color: "rgba(236,72,153,0.80)",  delay: "0.7s", anim: "animate-float-slow" },
            { size: 5,  left: "85%", top: "320px", color: "rgba(251,146,60,0.70)",  delay: "1.4s", anim: "animate-float"      },
            { size: 3,  left: "9%",  top: "370px", color: "rgba(6,182,212,0.70)",   delay: "0.3s", anim: "animate-float-slow" },
            { size: 4,  left: "60%", top: "150px", color: "rgba(167,139,250,0.60)", delay: "1.0s", anim: "animate-float"      },
            { size: 3,  left: "28%", top: "410px", color: "rgba(236,72,153,0.50)",  delay: "1.7s", anim: "animate-float-slow" },
          ] as const).map((p, i) => (
            <div key={i} className={`absolute rounded-full ${p.anim}`}
              style={{ width: p.size, height: p.size, left: p.left, top: p.top,
                background: p.color, boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
                filter: "blur(0.5px)", animationDelay: p.delay }} />
          ))}
        </div>

        {/* ── TITLE — at top, above wolf ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-5 pt-4 gap-1">
          <Badge small />
          <div className="mt-1.5"><Headline small /></div>
          <p className="text-white/65 text-[0.72rem] font-medium leading-relaxed max-w-[240px] mt-0.5">
            No sign-ups. No downloads. Just pure fun! 🎉
          </p>
        </div>

        {/* ── WOLF PEEK ZONE — overflow:hidden clips body, only head/paws visible ── */}
        <div className="relative z-[5] mt-[-98px] overflow-hidden"
          style={{ height: "clamp(230px, 62vw, 300px)" }}>
          {/* Wolf — 50% larger, starts at top, body extends below and gets clipped */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none"
            style={{ width: "clamp(420px, 129vw, 540px)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ui-assets/mascot-wolf.png" alt="" aria-hidden
              className="w-full h-auto animate-float"
              style={{ filter: "drop-shadow(0 0 60px rgba(124,58,237,0.72)) drop-shadow(0 12px 35px rgba(0,0,0,0.55))",
                transform: "rotate(-2deg)", opacity: 0.93 }} />
          </div>
          {/* Bottom fade — wolf dissolves into foreground */}
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent 0%, #07040f 100%)" }} />
        </div>

        {/* ── ACTION SECTION — foreground layer; background covers wolf body ── */}
        <div className="relative z-20 flex flex-col gap-3 px-4 pt-3"
          style={{ background: "#07040f" }}>
          {nicknameCard}
          {ctaButtons}
          {joinInput}
        </div>

        {/* ── STATS ── */}
        <div className="relative z-20 grid grid-cols-2 gap-3 px-4 mt-8"
          style={{ background: "#07040f" }}>
          {STATS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-violet-500/20 px-4 py-4"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.30)" }}>
              <span className="text-2xl shrink-0 leading-none">{s.icon}</span>
              <div>
                <p className="text-[1.05rem] font-black text-white leading-none">{s.value}</p>
                <p className="text-[0.62rem] text-white/45 mt-0.5 whitespace-nowrap">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="relative z-20 px-4 mt-8 pb-10"
          style={{ background: "#07040f" }}>
          <p className="text-center text-[0.65rem] font-black uppercase tracking-[0.22em] text-white/35 mb-4">
            ✨ How it works
          </p>
          <div className="grid grid-cols-2 gap-3">
            {STEPS.map((s) => (
              <div key={s.num} className="flex flex-col gap-3 rounded-2xl border border-white/[0.12] p-4"
                style={{ background: "rgba(255,255,255,0.09)", backdropFilter: "blur(20px)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.25)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/35 flex items-center justify-center text-[0.65rem] font-black text-violet-200 shrink-0 border border-violet-500/25">
                    {s.num}
                  </div>
                  <span className="text-2xl leading-none">{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-black text-white/90 leading-snug">{s.title}</p>
                  <p className="text-[0.65rem] text-white/50 leading-snug mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════ DESKTOP LAYOUT ═══════════════════════════════ */}
      <div className="hidden md:flex flex-col flex-1 min-h-0">

        {/* hero 3-column grid */}
        <div className="relative z-10 flex-1 min-h-0 grid lg:grid-cols-[340px_1fr_300px] xl:grid-cols-[400px_1fr_320px]">

          {/* wolf — absolutely positioned */}
          <div className="pointer-events-none select-none absolute bottom-0 left-0 z-10"
            style={{ width: "clamp(220px, 40vw, 700px)" }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(124,58,237,0.50) 0%, transparent 70%)", filter: "blur(50px)" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ui-assets/mascot-wolf.png" alt="" aria-hidden
              className="relative w-full h-auto animate-float"
              style={{ filter: "drop-shadow(0 0 50px rgba(124,58,237,0.55)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))", transform: "rotate(-2deg)", transformOrigin: "bottom center" }} />
          </div>

          {/* left spacer */}
          <div className="hidden lg:block" />

          {/* center content */}
          <div className="flex flex-col items-center justify-center gap-4 px-6 xl:px-8 py-6 text-center animate-slide-up">
            <Badge />
            <Headline />
            <p className="text-white/55 text-base font-medium max-w-sm leading-relaxed -mt-1">
              No sign-ups. No downloads. Just pure fun! 🎉
            </p>
            <div className="w-full max-w-[420px]">{nicknameCard}</div>
            <div className="w-full max-w-[420px]">{ctaButtons}</div>
            <div className="w-full max-w-[420px]">{joinInput}</div>
          </div>

          {/* right panels */}
          <div className="hidden lg:flex flex-col justify-center gap-3 px-4 py-6">
            {/* Live Activity */}
            <div className="rounded-2xl border border-white/[0.08] p-5"
              style={{ background: "rgba(255,255,255,0.045)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/40">Live Activity</p>
                </div>
                <span className="text-[0.6rem] text-white/20">just now</span>
              </div>
              <div className="flex flex-col gap-3">
                {LIVE_ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: item.color + "30", border: `1.5px solid ${item.color}60` }}>
                      {item.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.72rem] leading-snug truncate">
                        <span className="font-black text-white/90">{item.user}</span>
                        <span className="text-white/50"> {item.action}</span>
                      </p>
                    </div>
                    <span className="text-[0.62rem] text-white/22 shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Games */}
            <div className="rounded-2xl border border-white/[0.08] p-5"
              style={{ background: "rgba(255,255,255,0.045)", backdropFilter: "blur(20px)" }}>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Trending Games</p>
              <div className="flex flex-col gap-3.5">
                {TRENDING.map((g, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl leading-none shrink-0">{g.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[0.75rem] font-bold text-white/85">{g.name}</p>
                        <span className="text-[0.6rem] text-white/30">{g.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full" style={{ width: `${g.bar}%`, background: g.grad }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* desktop bottom strip */}
        <div className="relative z-10 shrink-0 border-t border-white/[0.06]"
          style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(16px)" }}>
          {/* stats */}
          <div className="grid grid-cols-4 border-b border-white/[0.05] max-w-4xl mx-auto w-full">
            {STATS.map((s, i) => (
              <div key={i} className={`flex items-center justify-center gap-3 py-4 px-4 ${i < 3 ? "border-r border-white/[0.05]" : ""}`}>
                <span className="text-2xl shrink-0">{s.icon}</span>
                <div>
                  <p className="text-base font-black text-white leading-none">{s.value}</p>
                  <p className="text-[0.62rem] text-white/30 mt-0.5 font-medium whitespace-nowrap">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          {/* how it works */}
          <div className="px-6 py-3 max-w-4xl mx-auto w-full">
            <div className="flex items-stretch gap-4">
              <div className="flex items-center shrink-0 pr-4 border-r border-white/[0.05]">
                <p className="text-[0.7rem] font-black text-white/30 whitespace-nowrap">
                  How it works <span className="text-yellow-400/50">✨</span>
                </p>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-2">
                {STEPS.map((s) => (
                  <div key={s.num} className="flex items-center gap-2.5 rounded-xl px-3 py-2 border border-white/[0.05] hover:border-white/10 transition-colors"
                    style={{ background: "rgba(255,255,255,0.025)" }}>
                    <div className="w-6 h-6 rounded-lg bg-violet-500/25 flex items-center justify-center text-[0.65rem] font-black text-violet-300 shrink-0">
                      {s.num}
                    </div>
                    <div>
                      <p className="text-[0.72rem] font-bold text-white/75 leading-none">{s.title}</p>
                      <p className="text-[0.6rem] text-white/28 mt-0.5 leading-snug">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* crown mascot — desktop only */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 select-none hidden md:block"
        style={{ width: "clamp(160px, 25vw, 405px)" }}>
        <div className="absolute bottom-0 right-0 w-full h-full rounded-full"
          style={{ background: "radial-gradient(circle at 50% 80%, rgba(139,92,246,0.35) 0%, transparent 70%)", filter: "blur(20px)", transform: "scale(1.4)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ui-assets/mascot-crown.png" alt="" aria-hidden
          className="relative w-full h-auto object-contain animate-float"
          style={{ animationDelay: "0.5s", filter: "drop-shadow(0 0 30px rgba(139,92,246,0.5))", mixBlendMode: "multiply" }} />
      </div>

      {/* error toast */}
      {error && (
        <div className="animate-slide-up fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm font-bold text-red-300 backdrop-blur-xl whitespace-nowrap">
          ⚠️ {error}
        </div>
      )}
    </main>
  );
}
