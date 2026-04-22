"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Stroke } from "@/lib/types";
import { drawStroke, floodFill } from "@/lib/canvas";

type Tool = "pen" | "eraser" | "fill" | "line";

type CanvasProps = {
  isDrawer: boolean;
  strokes: Stroke[];
  onStroke: (stroke: Stroke) => void;
  onClear: () => void;
  onUndo: () => void;
};

const COLORS = [
  "#000000", "#FFFFFF", "#6B7280",
  "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16",
  "#7C3AED", "#F59E0B", "#14B8A6",
  "#92400E", "#1E3A5F", "#FDE68A",
];

const SIZES = [3, 6, 12, 24, 40];

const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: "pen",    icon: "✏️", label: "Pen" },
  { id: "eraser", icon: "🧹", label: "Eraser" },
  { id: "fill",   icon: "🪣", label: "Fill" },
  { id: "line",   icon: "📏", label: "Line" },
];

export default function Canvas({ isDrawer, strokes, onStroke, onClear, onUndo }: CanvasProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const previewRef    = useRef<HTMLCanvasElement>(null);
  const lastStrokeCount = useRef(0);
  const isDrawing     = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const lineStartRef  = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef    = useRef<{ x: number; y: number } | null>(null);
  const scaleRef      = useRef(1); // canvas CSS px / logical px

  const [tool,      setTool]      = useState<Tool>("pen");
  const [color,     setColor]     = useState("#000000");
  const [size,      setSize]      = useState(6);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const activeColor = tool === "eraser" ? "#FFFFFF" : color;

  // ── Scale tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    function updateScale() {
      const c = canvasRef.current;
      if (c) scaleRef.current = c.getBoundingClientRect().width / c.width;
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // ── Redraw ────────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const s of strokes) drawStroke(ctx, s);
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (strokes.length > lastStrokeCount.current && lastStrokeCount.current > 0) {
      for (let i = lastStrokeCount.current; i < strokes.length; i++) {
        drawStroke(ctx, strokes[i]);
      }
    } else {
      redraw();
    }
    lastStrokeCount.current = strokes.length;
  }, [strokes, redraw]);

  useEffect(() => {
    if (strokes.length === 0) { lastStrokeCount.current = 0; redraw(); }
  }, [strokes.length, redraw]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDrawer) return;
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); onUndo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawer, onUndo]);

  // ── Coords ────────────────────────────────────────────────────────────────
  function getCanvasPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src =
      "touches" in e
        ? (e.touches[0] ?? (e as React.TouchEvent).changedTouches[0])
        : e;
    if (!src) return lastPosRef.current ?? { x: 0, y: 0 };
    return {
      x: ((src as Touch | MouseEvent).clientX - rect.left) * scaleX,
      y: ((src as Touch | MouseEvent).clientY - rect.top) * scaleY,
    };
  }

  function getCssPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const src =
      "touches" in e
        ? (e.touches[0] ?? (e as React.TouchEvent).changedTouches[0])
        : e;
    if (!src) return null;
    const x = (src as Touch | MouseEvent).clientX - rect.left;
    const y = (src as Touch | MouseEvent).clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    return { x, y };
  }

  // ── Line preview canvas ───────────────────────────────────────────────────
  function clearPreview() {
    const c = previewRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
  }

  function drawLinePreview(start: { x: number; y: number }, end: { x: number; y: number }) {
    const c = previewRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawer) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    lastPosRef.current = pos;

    if (tool === "fill") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      floodFill(ctx, pos.x, pos.y, activeColor);
      onStroke({ points: [pos], color: activeColor, size, fill: true });
      return;
    }

    if (tool === "line") {
      lineStartRef.current = pos;
      isDrawing.current = true;
      return;
    }

    // pen / eraser
    isDrawing.current = true;
    currentPoints.current = [pos];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = activeColor;
    ctx.fill();
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawer) return;
    e.preventDefault();

    const cssPos = getCssPos(e);
    setCursorPos(cssPos);

    if (!isDrawing.current) return;
    const pos = getCanvasPos(e);
    lastPosRef.current = pos;

    if (tool === "line") {
      if (lineStartRef.current) drawLinePreview(lineStartRef.current, pos);
      return;
    }

    currentPoints.current.push(pos);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pts = currentPoints.current;
    if (pts.length < 2) return;

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else {
      const p0 = pts[pts.length - 3];
      const p1 = pts[pts.length - 2];
      const p2 = pts[pts.length - 1];
      const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.stroke();
    }
  }

  function handleEnd() {
    if (!isDrawer || !isDrawing.current) return;
    isDrawing.current = false;

    if (tool === "line") {
      const start = lineStartRef.current;
      const end = lastPosRef.current;
      lineStartRef.current = null;
      clearPreview();
      if (start && end && (Math.abs(start.x - end.x) > 1 || Math.abs(start.y - end.y) > 1)) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        onStroke({ points: [start, end], color: activeColor, size });
      }
      return;
    }

    if (currentPoints.current.length > 0) {
      onStroke({ points: [...currentPoints.current], color: activeColor, size });
      currentPoints.current = [];
    }
  }

  // ── Cursor size in CSS px ─────────────────────────────────────────────────
  const cssCursorSize = Math.max(size * scaleRef.current, 4);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 h-full min-h-0 overflow-hidden">

      {/* Canvas + overlays */}
      <div
        className="relative w-full max-w-[800px] min-h-0 flex-1"
        onMouseLeave={() => { setCursorPos(null); handleEnd(); }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full rounded-2xl border-2 border-surface-lighter bg-white touch-none"
          style={{ aspectRatio: "4/3", maxHeight: "100%", cursor: isDrawer ? "none" : "default" }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

        {/* Line preview overlay */}
        <canvas
          ref={previewRef}
          width={800}
          height={600}
          className="pointer-events-none absolute inset-0 w-full h-full rounded-2xl"
          style={{ aspectRatio: "4/3", maxHeight: "100%" }}
        />

        {/* Cursor preview */}
        {isDrawer && cursorPos && tool !== "fill" && (
          <div
            className="pointer-events-none absolute rounded-full border-2 transition-none"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              width: cssCursorSize,
              height: cssCursorSize,
              transform: "translate(-50%, -50%)",
              backgroundColor:
                tool === "eraser" ? "rgba(200,200,200,0.3)" : `${activeColor}28`,
              borderColor: tool === "eraser" ? "#9ca3af" : activeColor,
            }}
          />
        )}
        {isDrawer && cursorPos && tool === "fill" && (
          <div
            className="pointer-events-none absolute text-xl select-none"
            style={{ left: cursorPos.x + 6, top: cursorPos.y - 20 }}
          >
            🪣
          </div>
        )}
      </div>

      {/* Toolbar */}
      {isDrawer && (
        <div className="glass shrink-0 w-full max-w-[800px] rounded-2xl overflow-hidden">

          {/* Row 1 — Colors */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-none">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }}
                title={c}
                className={`shrink-0 h-7 w-7 rounded-full border-2 transition-all ${
                  color === c && tool !== "eraser"
                    ? "scale-125 border-foreground shadow-md ring-2 ring-foreground/20"
                    : "border-surface-lighter hover:scale-110 hover:border-foreground/40"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="h-px bg-surface-lighter/30 mx-3" />

          {/* Row 2 — Sizes + tools + undo + clear */}
          <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-none">
            {/* Active color dot */}
            <div
              className="shrink-0 h-7 w-7 rounded-full border-2 border-surface-lighter shadow-inner"
              style={{ backgroundColor: tool === "eraser" ? "#FFFFFF" : color }}
            />
            <div className="shrink-0 h-5 w-px bg-surface-lighter/50" />

            {/* Size dots */}
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  size === s
                    ? "bg-accent/25 border border-accent"
                    : "hover:bg-surface-lighter"
                }`}
              >
                <div
                  className="rounded-full"
                  style={{
                    backgroundColor: tool === "eraser" ? "#6B7280" : color,
                    width: Math.min(s * 0.75, 22),
                    height: Math.min(s * 0.75, 22),
                  }}
                />
              </button>
            ))}

            <div className="shrink-0 h-5 w-px bg-surface-lighter/50" />

            {/* Tool buttons */}
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.label}
                className={`shrink-0 rounded-xl px-2.5 py-1.5 text-sm font-bold transition-all whitespace-nowrap ${
                  tool === t.id
                    ? "bg-accent/25 border border-accent text-accent-light"
                    : "bg-surface-lighter/50 text-foreground/50 hover:bg-surface-lighter hover:text-foreground"
                }`}
              >
                {t.icon}
              </button>
            ))}

            <div className="shrink-0 h-5 w-px bg-surface-lighter/50" />

            {/* Undo */}
            <button
              onClick={onUndo}
              title="Undo (Ctrl+Z)"
              className="shrink-0 rounded-xl bg-surface-lighter/50 px-3 py-1.5 text-xs font-bold text-foreground/50 transition-all hover:bg-surface-lighter hover:text-foreground whitespace-nowrap"
            >
              ↩ Undo
            </button>

            {/* Clear */}
            <button
              onClick={onClear}
              className="shrink-0 rounded-xl bg-danger/10 px-3 py-1.5 text-xs font-bold text-danger transition-all hover:bg-danger/20 active:scale-90 whitespace-nowrap"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
