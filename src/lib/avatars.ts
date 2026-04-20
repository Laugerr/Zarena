const AVATARS = [
  "🦊", "🐼", "🦅", "🦦", "🐺", "🐱", "🐸", "🦁",
  "🐧", "🦈", "🐯", "🐨", "🦎", "🐙", "🦜", "🐻",
  "🦄", "🐲", "🦋", "🐬", "🦉", "🐰", "🐵", "🦥",
];

/** Get a consistent avatar emoji based on a string (player id or name) */
export function getAvatar(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return AVATARS[Math.abs(hash) % AVATARS.length];
}
