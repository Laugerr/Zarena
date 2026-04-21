"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Stroke } from "@/lib/types";

type CanvasProps = {
  isDrawer: boolean;
  strokes: Stroke[];
  onStroke: (stroke: Stroke) => void;
  onClear: () => void;
};

const COLORS = [
  "#000000", "#FFFFFF", "#6B7280",
  "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16",
  "#7C3AED", "#F59E0B", "#14B8A6",
];

const SIZES = [3, 6, 12, 24, 40];

export default function Canvas({ isDrawer, strokes, onStroke, onClear }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const lastStrokeCount = useRef(0);

  const activeColor = isEraser ? "#FFFFFF" : color;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) drawStroke(ctx, stroke);
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
    if (strokes.length === 0) {
      lastStrokeCount.current = 0;
      redraw();
    }
  }, [strokes.length, redraw]);

  function getCanvasPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawer) return;
    e.preventDefault();
    isDrawing.current = true;
    const pos = getCanvasPos(e);
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
    if (!isDrawer || !isDrawing.current) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
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
      // Smooth bezier through midpoints
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
    if (currentPoints.current.length > 0) {
      onStroke({ points: [...currentPoints.current], color: activeColor, size });
      currentPoints.current = [];
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 h-full min-h-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full max-w-[800px] min-h-0 flex-1 rounded-2xl border-2 border-surface-lighter bg-white touch-none"
        style={{
          aspectRatio: "4/3",
          maxHeight: "100%",
          cursor: isDrawer ? (isEraser ? "cell" : "crosshair") : "default",
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {isDrawer && (
        <div className="glass shrink-0 w-full max-w-[800px] rounded-2xl overflow-hidden">
          {/* Row 1 — Colors (horizontal scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto px-3 py-2.5 scrollbar-none">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setIsEraser(false); }}
                title={c}
                className={`shrink-0 h-7 w-7 rounded-full border-2 transition-all ${
                  color === c && !isEraser
                    ? "scale-125 border-foreground shadow-md ring-2 ring-foreground/20"
                    : "border-surface-lighter hover:scale-110 hover:border-foreground/40"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-lighter/30 mx-3" />

          {/* Row 2 — Active preview + sizes + eraser + clear */}
          <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-none">
            {/* Active color/eraser preview */}
            <div
              className="shrink-0 h-7 w-7 rounded-full border-2 border-surface-lighter shadow-inner"
              style={{ backgroundColor: isEraser ? "#FFFFFF" : color }}
              title="Active color"
            />
            <div className="shrink-0 h-5 w-px bg-surface-lighter/50" />

            {/* Sizes */}
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => { setSize(s); setIsEraser(false); }}
                className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  size === s && !isEraser
                    ? "bg-accent/25 border border-accent"
                    : "hover:bg-surface-lighter"
                }`}
              >
                <div
                  className="rounded-full"
                  style={{
                    backgroundColor: isEraser ? "#6B7280" : color,
                    width: Math.min(s * 0.75, 22),
                    height: Math.min(s * 0.75, 22),
                  }}
                />
              </button>
            ))}

            <div className="shrink-0 h-5 w-px bg-surface-lighter/50" />

            {/* Eraser */}
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                isEraser
                  ? "bg-pink/20 text-pink border border-pink/40"
                  : "bg-surface-lighter/50 text-foreground/50 hover:bg-surface-lighter hover:text-foreground"
              }`}
            >
              ✏️ Erase
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

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return;

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (stroke.points.length === 1) {
    ctx.beginPath();
    ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

  if (stroke.points.length === 2) {
    ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
  } else {
    // Smooth bezier replay
    for (let i = 1; i < stroke.points.length - 1; i++) {
      const mid = {
        x: (stroke.points[i].x + stroke.points[i + 1].x) / 2,
        y: (stroke.points[i].y + stroke.points[i + 1].y) / 2,
      };
      ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, mid.x, mid.y);
    }
    const last = stroke.points[stroke.points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.stroke();
}
