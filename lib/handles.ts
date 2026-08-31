const ADJECTIVES = [
  "Whisper",
  "Shadow",
  "Ghost",
  "Cipher",
  "Ledger",
  "Ember",
  "Rook",
  "Marlowe",
  "Velvet",
  "Static",
  "Fox",
  "Cinder",
  "Vault",
  "Wire",
  "Raven",
  "Compass",
  "Splinter",
  "Mirage",
  "Sable",
  "Drifter",
];

export function generateHandle(): string {
  const word = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  return `The ${word}`;
}
