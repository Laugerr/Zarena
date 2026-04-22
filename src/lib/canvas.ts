import type { Stroke } from "./types";

// ---------------------------------------------------------------------------
// Flood fill
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillHex: string
) {
  const canvas = ctx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const sx = Math.round(startX);
  const sy = Math.round(startY);
  if (sx < 0 || sx >= w || sy < 0 || sy >= h) return;

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const bi = (x: number, y: number) => (y * w + x) * 4;
  const ti = bi(sx, sy);
  const tr = data[ti], tg = data[ti + 1], tb = data[ti + 2], ta = data[ti + 3];

  const [fr, fg, fb] = hexToRgb(fillHex);
  if (tr === fr && tg === fg && tb === fb && ta === 255) return; // already this color

  const TOLERANCE = 30;
  function matches(i: number) {
    return (
      Math.abs(data[i] - tr) <= TOLERANCE &&
      Math.abs(data[i + 1] - tg) <= TOLERANCE &&
      Math.abs(data[i + 2] - tb) <= TOLERANCE &&
      Math.abs(data[i + 3] - ta) <= TOLERANCE
    );
  }

  const visited = new Uint8Array(w * h);
  const stack: number[] = [sy * w + sx];

  while (stack.length > 0) {
    const pos = stack.pop()!;
    const x = pos % w;
    const y = (pos / w) | 0;
    if (x < 0 || x >= w || y < 0 || y >= h || visited[pos]) continue;
    const i = pos * 4;
    if (!matches(i)) continue;

    visited[pos] = 1;
    data[i] = fr;
    data[i + 1] = fg;
    data[i + 2] = fb;
    data[i + 3] = 255;

    stack.push(pos + 1, pos - 1, pos + w, pos - w);
  }

  ctx.putImageData(imageData, 0, 0);
}

// ---------------------------------------------------------------------------
// Stroke drawing
// ---------------------------------------------------------------------------

export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.fill) {
    if (stroke.points.length > 0) {
      floodFill(ctx, stroke.points[0].x, stroke.points[0].y, stroke.color);
    }
    return;
  }

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
