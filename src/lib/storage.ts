const ratingStorageKey = "il-lora-showcase-rating";

export function getStoredRating(fallback: string): string {
  try {
    return localStorage.getItem(ratingStorageKey) || fallback;
  } catch {
    return fallback;
  }
}

export function setStoredRating(ratingId: string): void {
  try {
    localStorage.setItem(ratingStorageKey, ratingId);
  } catch {
    return;
  }
}
