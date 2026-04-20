/** Characters used in room codes (no ambiguous chars like 0/O, 1/I/L) */
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Generate a 6-character room code like BRAVO7 */
export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

/** Validate that a string looks like a valid room code */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}
