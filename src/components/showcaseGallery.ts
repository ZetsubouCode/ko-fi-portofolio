import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml, getRequiredElement } from "../lib/dom";
import { getStoredRating, setStoredRating } from "../lib/storage";
import { getVariantForRating, getVariantRatingId, getVariantRatingLabel } from "../lib/rating";
import type { Collection, RatingMode, ShowcaseItem, SourceType } from "../types/site";
import { Lightbox, type LightboxItem } from "./lightbox";

type GalleryState = {
  rating: string;
  collectionId: string;
  sourceType: string;
  searchQuery: string;
  blurRRated: boolean;
  visibleLimit: number;
};

type VisibleItem = {
  collection: Collection;
  item: ShowcaseItem;
  image: NonNullable<ReturnType<typeof getVariantForRating>>;
  ratingLabel: string;
  ratingId: string | null;
};

type SourceTypeOption = {
  id: string;
  label: string;
};

const galleryPageSize = 32;

function getCollectionSourceType(collection: Collection): string {
  const legacyCollection = collection as Collection & { source_type?: string };
  return collection.sourceType || legacyCollection.source_type || "";
}

function getSourceTypeOptions(collections: Collection[], sourceTypes: SourceType[] = []): SourceTypeOption[] {
  const activeSourceTypes = sourceTypes.filter((sourceType) => sourceType.active !== false);

  if (activeSourceTypes.length > 0) {
    return activeSourceTypes.map((sourceType) => ({ id: sourceType.id, label: sourceType.label }));
  }

  return [...new Set(collections.map((collection) => getCollectionSourceType(collection)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((sourceType) => ({ id: sourceType, label: sourceType }));
}

export class ShowcaseGallery {
  private readonly root: HTMLElement;
  private readonly collections: Collection[];
  private readonly sourceTypes: SourceTypeOption[];
  private readonly ratingModes: RatingMode[];
  private readonly lightbox: Lightbox;
  private state: GalleryState;

  constructor(root: HTMLElement, collections: Collection[], ratingModes: RatingMode[], sourceTypes: SourceType[] = []) {
    this.root = root;
    this.collections = collections;
    this.sourceTypes = getSourceTypeOptions(collections, sourceTypes);
    this.ratingModes = ratingModes;
    this.lightbox = new Lightbox();
    this.state = {
      rating: getStoredRating(ratingModes[0]?.id ?? "pg"),
      collectionId: "all",
      sourceType: "all",
      searchQuery: "",
      blurRRated: true,
      visibleLimit: galleryPageSize,
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
    this.resetVisibleLimit();
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
        <span>Search</span>
        <input data-filter-search type="search" value="${escapeHtml(this.state.searchQuery)}" placeholder="Search LoRA or collection" />
      </label>
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
      <label class="filter-field">
        <span>Source type</span>
        <select data-filter-source-type>
          <option value="all"${this.state.sourceType === "all" ? " selected" : ""}>All</option>
          ${this.sourceTypes
            .map(
              (sourceType) =>
                `<option value="${escapeHtml(sourceType.id)}"${this.state.sourceType === sourceType.id ? " selected" : ""}>${escapeHtml(sourceType.label)}</option>`,
            )
            .join("")}
        </select>
      </label>
      <label class="privacy-toggle">
        <input data-toggle-r-blur type="checkbox"${this.state.blurRRated ? " checked" : ""} />
        <span>Blur R images</span>
      </label>
    `;
  }

  private bindControls(): void {
    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const ratingButton = target.closest<HTMLButtonElement>("[data-rating]");
      const cardButton = target.closest<HTMLButtonElement>("[data-lightbox-index]");
      const loadMoreButton = target.closest<HTMLButtonElement>("[data-load-more-showcase]");

      if (ratingButton) {
        this.state.rating = ratingButton.dataset.rating ?? this.state.rating;
        this.resetVisibleLimit();
        setStoredRating(this.state.rating);
        this.renderControls();
        this.renderGrid();
      }

      if (cardButton) {
        const index = Number(cardButton.dataset.lightboxIndex);
        this.lightbox.open(index);
      }

      if (loadMoreButton) {
        this.state.visibleLimit += galleryPageSize;
        this.renderGrid();
      }
    });

    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLElement;

      if (target.matches("[data-filter-collection]")) {
        const value = (target as HTMLSelectElement).value;
        this.state.collectionId = value;
        this.resetVisibleLimit();
        window.history.replaceState(null, "", value === "all" ? "#showcase" : `#${value}`);
        this.highlightCollection(value);
        this.renderGrid();
      }

      if (target.matches("[data-filter-source-type]")) {
        this.state.sourceType = (target as HTMLSelectElement).value;
        this.resetVisibleLimit();
        this.renderGrid();
      }

      if (target.matches("[data-toggle-r-blur]")) {
        this.state.blurRRated = (target as HTMLInputElement).checked;
        this.renderGrid();
      }
    });

    this.root.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;

      if (target.matches("[data-filter-search]")) {
        this.state.searchQuery = target.value;
        this.resetVisibleLimit();
        this.renderGrid();
      }
    });
  }

  private renderGrid(): void {
    const grid = getRequiredElement<HTMLElement>(".showcase-grid");
    const count = getRequiredElement<HTMLElement>(".gallery-count");
    const visibleItems = this.getVisibleItems();
    const renderedItems = visibleItems.slice(0, this.state.visibleLimit);
    const lightboxItems: LightboxItem[] = renderedItems.map((visible) => ({
      collection: visible.collection,
      title: visible.item.title,
      ratingLabel: visible.ratingLabel,
      image: visible.image,
    }));

    this.lightbox.setItems(lightboxItems);
    count.textContent =
      visibleItems.length === renderedItems.length
        ? `${visibleItems.length} image${visibleItems.length === 1 ? "" : "s"}`
        : `${renderedItems.length} of ${visibleItems.length} images`;

    if (visibleItems.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No showcase image is available for this rating yet.</h3>
          <p>Try another rating mode or collection.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = renderedItems
      .map((visible, index) => this.renderShowcaseCard(visible, index))
      .join("") + this.renderLoadMore(visibleItems.length, renderedItems.length);

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

  private renderLoadMore(totalCount: number, renderedCount: number): string {
    if (renderedCount >= totalCount) {
      return "";
    }

    const remainingCount = totalCount - renderedCount;

    return `
      <div class="showcase-load-more">
        <button class="button button--secondary" type="button" data-load-more-showcase>
          Load ${Math.min(galleryPageSize, remainingCount)} more
        </button>
      </div>
    `;
  }

  private renderShowcaseCard(visible: VisibleItem, index: number): string {
    const { collection, item, image, ratingLabel, ratingId } = visible;
    const blurImage = this.state.blurRRated && ratingId === "r" && !image.isPlaceholder;

    return `
      <article class="showcase-card" data-collection="${escapeHtml(collection.id)}">
        <button class="showcase-card__image-button image-shell${blurImage ? " is-r-blurred" : ""}" type="button" data-lightbox-index="${index}" aria-label="Open ${escapeHtml(item.title)} preview">
          <img src="${escapeHtml(getAssetUrl(image.thumb))}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async" />
          <span class="image-placeholder">Showcase thumbnail placeholder</span>
          ${blurImage ? '<span class="showcase-card__privacy">R image hidden</span>' : ""}
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
    const searchQuery = this.state.searchQuery.trim().toLowerCase();

    this.collections.forEach((collection) => {
      if (this.state.collectionId !== "all" && collection.id !== this.state.collectionId) {
        return;
      }

      if (this.state.sourceType !== "all" && getCollectionSourceType(collection) !== this.state.sourceType) {
        return;
      }

      collection.showcase.forEach((item) => {
        if (
          searchQuery &&
          !item.title.toLowerCase().includes(searchQuery) &&
          !collection.title.toLowerCase().includes(searchQuery)
        ) {
          return;
        }

        const image = getVariantForRating(item, this.state.rating, this.ratingModes);
        if (!image) {
          return;
        }
        const ratingId = getVariantRatingId(item, image);

        visible.push({
          collection,
          item,
          image,
          ratingLabel: getVariantRatingLabel(item, image, this.ratingModes),
          ratingId,
        });
      });
    });

    return visible;
  }

  private resetVisibleLimit(): void {
    this.state.visibleLimit = galleryPageSize;
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
