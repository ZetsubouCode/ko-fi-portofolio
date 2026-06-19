import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml, getRequiredElement } from "../lib/dom";
import { getStoredRating, setStoredRating } from "../lib/storage";
import { getVariantForRating, getVariantRatingLabel } from "../lib/rating";
import type { Collection, RatingMode, ShowcaseItem } from "../types/site";
import { Lightbox, type LightboxItem } from "./lightbox";

type GalleryState = {
  rating: string;
  collectionId: string;
};

type VisibleItem = {
  collection: Collection;
  item: ShowcaseItem;
  image: NonNullable<ReturnType<typeof getVariantForRating>>;
  ratingLabel: string;
};

export class ShowcaseGallery {
  private readonly root: HTMLElement;
  private readonly collections: Collection[];
  private readonly ratingModes: RatingMode[];
  private readonly lightbox: Lightbox;
  private state: GalleryState;

  constructor(root: HTMLElement, collections: Collection[], ratingModes: RatingMode[]) {
    this.root = root;
    this.collections = collections;
    this.ratingModes = ratingModes;
    this.lightbox = new Lightbox();
    this.state = {
      rating: getStoredRating(ratingModes[0]?.id ?? "pg"),
      collectionId: "all",
    };
  }

  init(): void {
    this.renderShell();
    this.bindControls();
    this.applyHashFilter();
    this.renderGrid();
    window.addEventListener("hashchange", () => {
      this.applyHashFilter();
      this.renderControls();
      this.renderGrid();
    });
  }

  setCollection(collectionId: string): void {
    this.state.collectionId = collectionId;
    window.history.replaceState(null, "", collectionId === "all" ? "#showcase" : `#${collectionId}`);
    this.renderControls();
    this.renderGrid();
    getRequiredElement<HTMLElement>("#showcase").scrollIntoView({ behavior: "smooth", block: "start" });
    this.highlightCollection(collectionId);
  }

  private renderShell(): void {
    this.root.innerHTML = `
      <div class="section__inner">
        <div class="section-heading section-heading--row">
          <div>
            <p class="eyebrow">Showcase gallery</p>
            <h2>Browse images by rating and collection</h2>
          </div>
          <div class="gallery-count" aria-live="polite"></div>
        </div>
        <div class="gallery-controls" aria-label="Showcase filters"></div>
        <div class="showcase-grid" aria-live="polite"></div>
      </div>
    `;
    this.renderControls();
  }

  private renderControls(): void {
    const controls = getRequiredElement<HTMLElement>(".gallery-controls");

    controls.innerHTML = `
      <div class="rating-toggle" role="group" aria-label="Rating mode">
        ${this.ratingModes
          .map(
            (mode) => `
              <button
                class="rating-toggle__button ${this.state.rating === mode.id ? "is-active" : ""}"
                type="button"
                data-rating="${escapeHtml(mode.id)}"
                aria-current="${this.state.rating === mode.id ? "true" : "false"}"
              >
                ${escapeHtml(mode.label)}
              </button>
            `,
          )
          .join("")}
      </div>
      <label class="filter-field">
        <span>Collection</span>
        <select data-filter-collection>
          <option value="all"${this.state.collectionId === "all" ? " selected" : ""}>All</option>
          ${this.collections
            .map(
              (collection) =>
                `<option value="${escapeHtml(collection.id)}"${this.state.collectionId === collection.id ? " selected" : ""}>${escapeHtml(collection.title)}</option>`,
            )
            .join("")}
        </select>
      </label>
    `;
  }

  private bindControls(): void {
    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const ratingButton = target.closest<HTMLButtonElement>("[data-rating]");
      const cardButton = target.closest<HTMLButtonElement>("[data-lightbox-index]");

      if (ratingButton) {
        this.state.rating = ratingButton.dataset.rating ?? this.state.rating;
        setStoredRating(this.state.rating);
        this.renderControls();
        this.renderGrid();
      }

      if (cardButton) {
        const index = Number(cardButton.dataset.lightboxIndex);
        this.lightbox.open(index);
      }
    });

    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;

      if (target.matches("[data-filter-collection]")) {
        this.state.collectionId = target.value;
        window.history.replaceState(null, "", target.value === "all" ? "#showcase" : `#${target.value}`);
        this.highlightCollection(target.value);
        this.renderGrid();
      }
    });
  }

  private renderGrid(): void {
    const grid = getRequiredElement<HTMLElement>(".showcase-grid");
    const count = getRequiredElement<HTMLElement>(".gallery-count");
    const visibleItems = this.getVisibleItems();
    const lightboxItems: LightboxItem[] = visibleItems.map((visible) => ({
      collection: visible.collection,
      title: visible.item.title,
      ratingLabel: visible.ratingLabel,
      image: visible.image,
    }));

    this.lightbox.setItems(lightboxItems);
    count.textContent = `${visibleItems.length} image${visibleItems.length === 1 ? "" : "s"}`;

    if (visibleItems.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No showcase image is available for this rating yet.</h3>
          <p>Try another rating mode or collection.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = visibleItems
      .map((visible, index) => this.renderShowcaseCard(visible, index))
      .join("");

    grid.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
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

  private renderShowcaseCard(visible: VisibleItem, index: number): string {
    const { collection, item, image, ratingLabel } = visible;

    return `
      <article class="showcase-card" data-collection="${escapeHtml(collection.id)}">
        <button class="showcase-card__image-button image-shell" type="button" data-lightbox-index="${index}" aria-label="Open ${escapeHtml(item.title)} preview">
          <img src="${escapeHtml(getAssetUrl(image.thumb))}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" />
          <span class="image-placeholder">Showcase thumbnail placeholder</span>
          <span class="showcase-card__rating">${escapeHtml(ratingLabel)}</span>
        </button>
        <div class="showcase-card__body">
          <div class="showcase-card__meta">
            <span>${escapeHtml(collection.title)}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <div class="showcase-card__footer">
            ${
              collection.civitaiUrl
                ? `<a class="button button--secondary button--sm" href="${escapeHtml(collection.civitaiUrl)}" target="_blank" rel="noreferrer">${renderBrandLabel("civitai", "CivitAI post")}</a>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  private getVisibleItems(): VisibleItem[] {
    const visible: VisibleItem[] = [];

    this.collections.forEach((collection) => {
      if (this.state.collectionId !== "all" && collection.id !== this.state.collectionId) {
        return;
      }

      collection.showcase.forEach((item) => {
        const image = getVariantForRating(item, this.state.rating, this.ratingModes);
        if (!image) {
          return;
        }

        visible.push({
          collection,
          item,
          image,
          ratingLabel: getVariantRatingLabel(item, image, this.ratingModes),
        });
      });
    });

    return visible;
  }

  private applyHashFilter(): void {
    const hash = window.location.hash.replace("#", "");
    if (!hash || hash === "top" || hash === "showcase") {
      return;
    }

    const collection = this.collections.find((item) => item.id === hash);
    if (!collection) {
      return;
    }

    this.state.collectionId = collection.id;
    window.setTimeout(() => {
      getRequiredElement<HTMLElement>("#showcase").scrollIntoView({ behavior: "smooth", block: "start" });
      this.highlightCollection(collection.id);
    }, 60);
  }

  private highlightCollection(collectionId: string): void {
    document.querySelectorAll("[data-collection-card]").forEach((card) => {
      card.classList.toggle("is-highlighted", card.getAttribute("data-collection-card") === collectionId);
    });
  }
}
