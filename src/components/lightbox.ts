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
  private readonly panel: HTMLElement;
  private readonly media: HTMLElement;
  private readonly image: HTMLImageElement;
  private readonly title: HTMLElement;
  private readonly meta: HTMLElement;
  private readonly civitaiLink: HTMLAnchorElement;
  private readonly zoomLabel: HTMLElement;
  private readonly fullscreenButton: HTMLButtonElement;
  private items: LightboxItem[] = [];
  private activeIndex = 0;
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private dragStart: { x: number; y: number; panX: number; panY: number } | null = null;

  constructor() {
    this.element = this.createElement();
    document.body.append(this.element);
    this.panel = this.element.querySelector(".lightbox__panel") as HTMLElement;
    this.media = this.element.querySelector(".lightbox__media") as HTMLElement;
    this.image = this.element.querySelector(".lightbox__image") as HTMLImageElement;
    this.title = this.element.querySelector(".lightbox__title") as HTMLElement;
    this.meta = this.element.querySelector(".lightbox__meta") as HTMLElement;
    this.civitaiLink = this.element.querySelector(".lightbox__civitai") as HTMLAnchorElement;
    this.zoomLabel = this.element.querySelector(".lightbox__zoom-label") as HTMLElement;
    this.fullscreenButton = this.element.querySelector(".lightbox__fullscreen") as HTMLButtonElement;
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
    void this.exitFullscreen();
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
        <button class="lightbox__close icon-button" type="button" aria-label="Close image preview">x</button>
        <div class="lightbox__tools" aria-label="Image view controls">
          <button class="icon-button" type="button" data-lightbox-zoom-out aria-label="Zoom out">-</button>
          <span class="lightbox__zoom-label" aria-live="polite">100%</span>
          <button class="icon-button" type="button" data-lightbox-zoom-in aria-label="Zoom in">+</button>
          <button class="icon-button lightbox__reset" type="button" data-lightbox-zoom-reset aria-label="Reset zoom">1:1</button>
          <button class="lightbox__fullscreen icon-button" type="button" aria-label="Enter fullscreen">[]</button>
        </div>
        <button class="lightbox__nav lightbox__nav--prev icon-button" type="button" aria-label="Previous image">&lt;</button>
        <div class="lightbox__media image-shell">
          <img class="lightbox__image" alt="" decoding="async" draggable="false" />
          <span class="image-placeholder">Full image placeholder</span>
        </div>
        <button class="lightbox__nav lightbox__nav--next icon-button" type="button" aria-label="Next image">&gt;</button>
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
    this.element.querySelector("[data-lightbox-zoom-out]")?.addEventListener("click", () => this.zoomBy(-0.25));
    this.element.querySelector("[data-lightbox-zoom-in]")?.addEventListener("click", () => this.zoomBy(0.25));
    this.element.querySelector("[data-lightbox-zoom-reset]")?.addEventListener("click", () => this.resetView());
    this.fullscreenButton.addEventListener("click", () => void this.toggleFullscreen());
    this.media.addEventListener("wheel", (event) => this.handleWheel(event), { passive: false });
    this.media.addEventListener("pointerdown", (event) => this.startDrag(event));
    this.media.addEventListener("pointermove", (event) => this.drag(event));
    this.media.addEventListener("pointerup", () => this.stopDrag());
    this.media.addEventListener("pointercancel", () => this.stopDrag());
    document.addEventListener("fullscreenchange", () => this.syncFullscreenState());

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

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        this.zoomBy(0.25);
      }

      if (event.key === "-") {
        event.preventDefault();
        this.zoomBy(-0.25);
      }

      if (event.key === "0") {
        event.preventDefault();
        this.resetView();
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void this.toggleFullscreen();
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

  private clampZoom(value: number): number {
    return Math.min(5, Math.max(0.1, value));
  }

  private zoomBy(delta: number): void {
    this.zoom = this.clampZoom(this.zoom + delta);
    if (this.zoom <= 1) {
      this.panX = 0;
      this.panY = 0;
    }
    this.applyView();
  }

  private resetView(): void {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyView();
  }

  private applyView(): void {
    this.image.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    this.zoomLabel.textContent = `${Math.round(this.zoom * 100)}%`;
    this.media.classList.toggle("is-zoomed", this.zoom > 1);
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoomBy(event.deltaY < 0 ? 0.25 : -0.25);
  }

  private startDrag(event: PointerEvent): void {
    if (this.zoom <= 1 || event.button !== 0) {
      return;
    }

    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
      panX: this.panX,
      panY: this.panY,
    };
    this.media.classList.add("is-dragging");
    this.media.setPointerCapture(event.pointerId);
  }

  private drag(event: PointerEvent): void {
    if (!this.dragStart) {
      return;
    }

    this.panX = this.dragStart.panX + event.clientX - this.dragStart.x;
    this.panY = this.dragStart.panY + event.clientY - this.dragStart.y;
    this.applyView();
  }

  private stopDrag(): void {
    this.dragStart = null;
    this.media.classList.remove("is-dragging");
  }

  private async toggleFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await this.exitFullscreen();
      return;
    }

    await this.panel.requestFullscreen?.();
  }

  private async exitFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
    }
  }

  private syncFullscreenState(): void {
    const isFullscreen = document.fullscreenElement === this.panel;
    this.panel.classList.toggle("is-fullscreen", isFullscreen);
    this.fullscreenButton.setAttribute("aria-label", isFullscreen ? "Exit fullscreen" : "Enter fullscreen");
  }

  private renderActiveItem(): void {
    const item = this.items[this.activeIndex];
    if (!item) {
      return;
    }

    this.image.hidden = false;
    this.image.src = getAssetUrl(item.image.full);
    this.image.alt = item.image.alt;
    this.resetView();
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
