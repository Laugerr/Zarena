const ADJECTIVES = [
  "Blue",
  "Red",
  "Gold",
  "Neon",
  "Wild",
  "Sly",
  "Bold",
  "Chill",
  "Hype",
  "Swift",
  "Dark",
  "Mint",
  "Aqua",
  "Zen",
  "Rad",
] as const;

const ANIMALS = [
  "Fox",
  "Panda",
  "Eagle",
  "Otter",
  "Wolf",
  "Lynx",
  "Raven",
  "Shark",
  "Tiger",
  "Koala",
  "Gecko",
  "Falcon",
  "Bison",
  "Cobra",
  "Moose",
] as const;

export function generateName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj}${animal}`;
}
