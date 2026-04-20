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
  "#000000", "#FFFFFF", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#78716C",
];
const SIZES = [4, 8, 16, 32];

export default function Canvas({ isDrawer, strokes, onStroke, onClear }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(8);
  const lastStrokeCount = useRef(0);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
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
    ctx.fillStyle = color;
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

    const points = currentPoints.current;
    if (points.length < 2) return;
    const from = points[points.length - 2];
    const to = points[points.length - 1];

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function handleEnd() {
    if (!isDrawer || !isDrawing.current) return;
    isDrawing.current = false;

    if (currentPoints.current.length > 0) {
      const stroke: Stroke = {
        points: [...currentPoints.current],
        color,
        size,
      };
      onStroke(stroke);
      currentPoints.current = [];
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full max-w-[800px] rounded-2xl border-2 border-surface-light bg-white touch-none shadow-lg"
        style={{ aspectRatio: "4/3", cursor: isDrawer ? "crosshair" : "default" }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Drawing Tools */}
      {isDrawer && (
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-surface-light bg-surface px-5 py-3">
          {/* Colors */}
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${
                  color === c
                    ? "scale-125 border-accent ring-2 ring-accent/30"
                    : "border-surface-light hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-surface-light" />

          {/* Sizes */}
          <div className="flex items-center gap-1.5">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  size === s
                    ? "bg-accent/20 border border-accent"
                    : "bg-surface-light hover:bg-surface-light/80"
                }`}
              >
                <div
                  className="rounded-full bg-foreground"
                  style={{ width: Math.min(s, 20), height: Math.min(s, 20) }}
                />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-surface-light" />

          {/* Clear */}
          <button
            onClick={onClear}
            className="rounded-xl bg-danger/10 px-4 py-2 text-sm font-bold text-danger transition-all hover:bg-danger/20"
          >
            🗑️ Clear
          </button>
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
    const p = stroke.points[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
}
