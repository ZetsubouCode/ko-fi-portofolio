import { getAvailableRatingLabels } from "../lib/rating";
import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import type { Collection, RatingMode } from "../types/site";
import { escapeHtml } from "../lib/dom";

export function renderCollectionCards(collections: Collection[], ratingModes: RatingMode[]): string {
  const sortedCollections = [...collections].sort((a, b) => a.title.localeCompare(b.title));

  return `
    <section class="section" id="collections">
      <div class="section__inner">
        <div class="section-heading section-heading--row">
          <div>
            <p class="eyebrow">Featured collections</p>
            <h2>Featured LoRA collections</h2>
          </div>
          <a class="button button--ghost" href="#showcase">Open gallery</a>
        </div>
        <div class="collection-grid">
          ${sortedCollections.map((collection) => renderCollectionCard(collection, ratingModes)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderCollectionCard(collection: Collection, ratingModes: RatingMode[]): string {
  const ratings = new Set<string>();
  collection.showcase.forEach((item) => {
    getAvailableRatingLabels(item, ratingModes).forEach((label) => ratings.add(label));
  });

  return `
    <article class="collection-card" id="${escapeHtml(collection.id)}" data-collection-card="${escapeHtml(collection.id)}">
      <div class="image-shell collection-card__media">
        <img src="${escapeHtml(getAssetUrl(collection.cover))}" alt="${escapeHtml(collection.title)} cover" loading="lazy" decoding="async" />
        <span class="image-placeholder">Collection cover placeholder</span>
      </div>
      <div class="collection-card__body">
        <div class="collection-card__meta">
          <span>${escapeHtml(collection.series)}</span>
          <span>${escapeHtml(collection.sourceType)}</span>
          <span>${escapeHtml(collection.status)}</span>
        </div>
        <h3>${escapeHtml(collection.title)}</h3>
        <p>${escapeHtml(collection.description)}</p>
        <div class="chip-row">
          ${[...ratings].map((label) => `<span class="chip">${escapeHtml(label)}</span>`).join("")}
        </div>
        <div class="collection-card__actions">
          ${
            collection.civitaiUrl
              ? `<a class="button button--secondary button--sm" href="${escapeHtml(collection.civitaiUrl)}" target="_blank" rel="noreferrer">${renderBrandLabel("civitai", "CivitAI")}</a>`
              : ""
          }
          <button class="button button--ghost button--sm" type="button" data-view-collection="${escapeHtml(collection.id)}">View collection</button>
        </div>
      </div>
    </article>
  `;
}
