const STORAGE_KEY = "word-heist:player-id";

/** Returns the persisted anonymous player id, creating one on first visit. */
export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
