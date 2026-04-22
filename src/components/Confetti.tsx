"use client";

import { useEffect, useRef } from "react";

export default function Confetti({ onDone }: { onDone?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316", "#ffffff", "#a78bfa"];
    const pieces = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 400,
      w: 8 + Math.random() * 9,
      h: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 1.5 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
    }));

    let running = true;
    const startTime = Date.now();

    function animate() {
      if (!running || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = (Date.now() - startTime) / 1000;
      const alpha = Math.max(0, 1 - Math.max(0, elapsed - 3) / 2);

      for (const p of pieces) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        p.vy = Math.min(p.vy + 0.06, 9);
        p.vx *= 0.995;

        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.vy = 1.5 + Math.random() * 3;
        }
      }

      if (elapsed >= 5) {
        running = false;
        onDone?.();
        return;
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, [onDone]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" />;
}
