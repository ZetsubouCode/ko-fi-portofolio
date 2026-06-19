import type { Collection, ImageVariant } from "../types/site";
import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml } from "../lib/dom";

export type LightboxItem = {
  collection: Collection;
  title: string;
  ratingLabel: string;
  image: ImageVariant;
};

export class Lightbox {
  private readonly element: HTMLElement;
  private readonly image: HTMLImageElement;
  private readonly title: HTMLElement;
  private readonly meta: HTMLElement;
  private readonly civitaiLink: HTMLAnchorElement;
  private items: LightboxItem[] = [];
  private activeIndex = 0;

  constructor() {
    this.element = this.createElement();
    document.body.append(this.element);
    this.image = this.element.querySelector(".lightbox__image") as HTMLImageElement;
    this.title = this.element.querySelector(".lightbox__title") as HTMLElement;
    this.meta = this.element.querySelector(".lightbox__meta") as HTMLElement;
    this.civitaiLink = this.element.querySelector(".lightbox__civitai") as HTMLAnchorElement;
    this.bindEvents();
  }

  setItems(items: LightboxItem[]): void {
    this.items = items;
  }

  open(index: number): void {
    if (!this.items[index]) {
      return;
    }

    this.activeIndex = index;
    this.renderActiveItem();
    this.element.classList.add("is-open");
    this.element.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-lightbox");
    this.element.querySelector<HTMLButtonElement>(".lightbox__close")?.focus();
  }

  close(): void {
    this.element.classList.remove("is-open");
    this.element.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-lightbox");
    this.image.removeAttribute("src");
  }

  private createElement(): HTMLElement {
    const element = document.createElement("div");
    element.className = "lightbox";
    element.setAttribute("aria-hidden", "true");
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-modal", "true");
    element.setAttribute("aria-label", "Image preview");
    element.innerHTML = `
      <button class="lightbox__backdrop" type="button" aria-label="Close image preview"></button>
      <div class="lightbox__panel">
        <button class="lightbox__close icon-button" type="button" aria-label="Close image preview">×</button>
        <button class="lightbox__nav lightbox__nav--prev icon-button" type="button" aria-label="Previous image">‹</button>
        <div class="lightbox__media image-shell">
          <img class="lightbox__image" alt="" decoding="async" />
          <span class="image-placeholder">Full image placeholder</span>
        </div>
        <button class="lightbox__nav lightbox__nav--next icon-button" type="button" aria-label="Next image">›</button>
        <div class="lightbox__caption">
          <div>
            <p class="lightbox__meta"></p>
            <h2 class="lightbox__title"></h2>
          </div>
          <a class="button button--secondary button--sm lightbox__civitai" href="#" target="_blank" rel="noreferrer">${renderBrandLabel("civitai", "CivitAI")}</a>
        </div>
      </div>
    `;
    return element;
  }

  private bindEvents(): void {
    this.element.querySelector(".lightbox__close")?.addEventListener("click", () => this.close());
    this.element.querySelector(".lightbox__backdrop")?.addEventListener("click", () => this.close());
    this.element.querySelector(".lightbox__nav--prev")?.addEventListener("click", () => this.showOffset(-1));
    this.element.querySelector(".lightbox__nav--next")?.addEventListener("click", () => this.showOffset(1));

    document.addEventListener("keydown", (event) => {
      if (!this.element.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        this.close();
      }

      if (event.key === "ArrowLeft") {
        this.showOffset(-1);
      }

      if (event.key === "ArrowRight") {
        this.showOffset(1);
      }
    });
  }

  private showOffset(offset: number): void {
    if (this.items.length === 0) {
      return;
    }

    this.activeIndex = (this.activeIndex + offset + this.items.length) % this.items.length;
    this.renderActiveItem();
  }

  private renderActiveItem(): void {
    const item = this.items[this.activeIndex];
    if (!item) {
      return;
    }

    this.image.hidden = false;
    this.image.src = getAssetUrl(item.image.full);
    this.image.alt = item.image.alt;
    this.title.textContent = item.title;
    this.meta.innerHTML = `${escapeHtml(item.collection.title)} <span>${escapeHtml(item.ratingLabel)}</span>`;

    if (item.collection.civitaiUrl) {
      this.civitaiLink.hidden = false;
      this.civitaiLink.href = item.collection.civitaiUrl;
    } else {
      this.civitaiLink.hidden = true;
    }
  }
}
