"use client";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  vol = 0.22,
  delay = 0
) {
  const ac = getCtx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration);
  } catch {}
}

/** 🎉 Correct guess — ascending happy chord */
export function playCorrect() {
  tone(523, 0.12, "sine", 0.25, 0);
  tone(659, 0.12, "sine", 0.25, 0.09);
  tone(784, 0.22, "sine", 0.25, 0.18);
}

/** ⏰ Round end — descending resolve */
export function playRoundEnd() {
  tone(440, 0.15, "sine", 0.2, 0);
  tone(392, 0.15, "sine", 0.2, 0.14);
  tone(349, 0.3,  "sine", 0.2, 0.28);
}

/** 🏆 Game end — victory fanfare */
export function playGameEnd() {
  [523, 587, 659, 698, 784, 880].forEach((freq, i) =>
    tone(freq, 0.18, "sine", 0.22, i * 0.09)
  );
}

/** 🎮 Game start — upward sweep */
export function playStart() {
  tone(330, 0.1, "triangle", 0.2, 0);
  tone(440, 0.1, "triangle", 0.2, 0.1);
  tone(523, 0.18, "triangle", 0.2, 0.2);
}

/** ⏱ Urgent timer tick */
export function playTick() {
  tone(880, 0.04, "square", 0.06);
}

/** 💡 Hint revealed */
export function playHint() {
  tone(660, 0.08, "sine", 0.15, 0);
  tone(880, 0.12, "sine", 0.15, 0.08);
}
