import type { ImageVariant, RatingMode, ShowcaseItem } from "../types/site";

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function placeholderSvg(label: string, title: string): string {
  const safeLabel = escapeSvgText(label);
  const safeTitle = escapeSvgText(title);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${safeLabel} image placeholder">
      <rect width="800" height="1000" fill="#15191d"/>
      <rect x="56" y="56" width="688" height="888" rx="28" fill="#20262b" stroke="#3b4650" stroke-width="4"/>
      <text x="400" y="462" text-anchor="middle" fill="#f4f7f8" font-family="Arial, sans-serif" font-size="54" font-weight="700">No ${safeLabel} image</text>
      <text x="400" y="536" text-anchor="middle" fill="#aeb9c2" font-family="Arial, sans-serif" font-size="30">${safeTitle}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getPlaceholderVariant(item: ShowcaseItem, mode: RatingMode): ImageVariant {
  const image = placeholderSvg(mode.label, item.title);

  return {
    thumb: image,
    full: image,
    alt: `${item.title} does not have a ${mode.label} showcase image yet`,
    isPlaceholder: true,
    ratingId: mode.id,
  };
}

export function getVariantForRating(
  item: ShowcaseItem,
  selectedRating: string,
  ratingModes: RatingMode[],
): ImageVariant | null {
  const selectedMode = ratingModes.find((mode) => mode.id === selectedRating);

  if (!selectedMode) {
    return null;
  }

  if (item.variants[selectedMode.id]) {
    return item.variants[selectedMode.id];
  }

  return getPlaceholderVariant(item, selectedMode);
}

export function getVariantRatingLabel(
  item: ShowcaseItem,
  variant: ImageVariant,
  ratingModes: RatingMode[],
): string {
  if (variant.isPlaceholder) {
    const rating = ratingModes.find((mode) => mode.id === variant.ratingId);
    return rating ? `Missing ${rating.label}` : "Missing image";
  }

  const found = Object.entries(item.variants).find(([, image]) => image === variant);
  const rating = ratingModes.find((mode) => mode.id === found?.[0]);
  return rating?.label ?? "Unrated";
}

export function getAvailableRatingLabels(item: ShowcaseItem, ratingModes: RatingMode[]): string[] {
  return ratingModes
    .filter((mode) => Boolean(item.variants[mode.id]))
    .sort((a, b) => a.level - b.level)
    .map((mode) => mode.label);
}
