import { getAssetUrl } from "./assets";
import { escapeHtml } from "./dom";

export type Brand = "civitai" | "github" | "kofi" | "pixiv";

export function renderBrandIcon(brand: Brand): string {
  if (brand === "civitai" || brand === "kofi") {
    const src = brand === "civitai" ? "/assets/icons/civitai.svg" : "/assets/icons/kofi.png";

    return `<img class="brand-icon brand-icon--asset brand-icon--${brand}" src="${escapeHtml(getAssetUrl(src))}" alt="" aria-hidden="true" decoding="async" />`;
  }

  const icons: Record<Exclude<Brand, "civitai" | "kofi">, string> = {
    github: `
      <svg class="brand-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M12 2.3c-5.5 0-9.9 4.4-9.9 9.9 0 4.4 2.9 8.1 6.8 9.4.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.7 9.7 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7.7.8 1.1 1.6 1.1 2.7 0 3.8-2.3 4.7-4.6 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5a9.9 9.9 0 0 0 6.8-9.4c0-5.5-4.4-9.9-9.9-9.9Z"/>
      </svg>
    `,
    pixiv: `
      <svg class="brand-icon brand-icon--pixiv" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#0096FA"/>
        <path d="M8 18.6V6.2h5.1c2.9 0 4.9 1.8 4.9 4.4 0 2.8-2 4.6-4.9 4.6h-2.2v3.4H8Zm2.9-5.9h1.8c1.5 0 2.3-.8 2.3-2.1 0-1.2-.8-2-2.3-2h-1.8v4.1Z" fill="#FFFFFF"/>
      </svg>
    `,
  };

  return icons[brand];
}

export function renderBrandLabel(brand: Brand, label: string): string {
  return `${renderBrandIcon(brand)}<span>${escapeHtml(label)}</span>`;
}
