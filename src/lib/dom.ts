export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function slugToLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getRequiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}

export function setImageFallbacks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        console.warn(`Image failed to load: ${image.currentSrc || image.src}`);
        image.closest(".image-shell")?.classList.add("is-missing");
        image.hidden = true;
      },
      { once: true },
    );
  });
}
