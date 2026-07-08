import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml } from "../lib/dom";
import type { Collection, SelectedAdaptationItem, SiteData } from "../types/site";

type SelectedAdaptationView = {
  collection: Collection;
  item: SelectedAdaptationItem;
  fallbackOrder: number;
};

function cleanText(value: string | undefined, fallback = ""): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanList(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function getSelectedAdaptations(site: SiteData, collections: Collection[]): SelectedAdaptationView[] {
  const section = site.selectedAdaptations;
  if (!section || section.enabled === false || !Array.isArray(section.items)) {
    return [];
  }

  return section.items
    .map((item, index) => ({ item, fallbackOrder: index }))
    .filter(({ item }) => item.active !== false && cleanText(item.collectionId))
    .map(({ item, fallbackOrder }) => ({
      item,
      fallbackOrder,
      collection: collections.find((collection) => collection.id === item.collectionId),
    }))
    .filter((entry): entry is SelectedAdaptationView => Boolean(entry.collection))
    .sort((a, b) => (a.item.order ?? a.fallbackOrder) - (b.item.order ?? b.fallbackOrder));
}

function renderNotes(notes: string[]): string {
  if (!notes.length) {
    return "";
  }

  return `
    <ul class="selected-adaptation-card__notes">
      ${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
    </ul>
  `;
}

function renderCard({ collection, item }: SelectedAdaptationView): string {
  const title = cleanText(item.title, collection.title);
  const description = cleanText(item.description, collection.description);
  const whyMatters = cleanText(item.whyMatters);
  const notes = cleanList(item.notes);
  const tags = cleanList(item.tags).length ? cleanList(item.tags) : collection.highlights.slice(0, 4);
  const ctaLabel = cleanText(item.ctaLabel, "View collection");

  return `
    <article class="selected-adaptation-card" data-selected-adaptation="${escapeHtml(collection.id)}">
      <div class="image-shell selected-adaptation-card__media">
        <img src="${escapeHtml(getAssetUrl(collection.cover))}" alt="${escapeHtml(collection.title)} selected adaptation cover" loading="lazy" decoding="async" />
        <span class="image-placeholder">Selected adaptation cover placeholder</span>
      </div>
      <div class="selected-adaptation-card__body">
        <div class="collection-card__meta">
          <span>${escapeHtml(collection.series)}</span>
          <span>${escapeHtml(collection.sourceType)}</span>
          <span>${escapeHtml(collection.status)}</span>
        </div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        ${
          whyMatters
            ? `<div class="selected-adaptation-card__why"><span>Why it matters</span><p>${escapeHtml(whyMatters)}</p></div>`
            : ""
        }
        ${renderNotes(notes)}
        <div class="chip-row">
          ${tags.map((tag) => `<span class="chip chip--muted">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="collection-card__actions selected-adaptation-card__actions">
          <button class="button button--secondary button--sm" type="button" data-view-collection="${escapeHtml(collection.id)}">${escapeHtml(ctaLabel)}</button>
          ${
            collection.civitaiUrl
              ? `<a class="button button--ghost button--sm" href="${escapeHtml(collection.civitaiUrl)}" target="_blank" rel="noreferrer">${renderBrandLabel("civitai", "CivitAI")}</a>`
              : ""
          }
        </div>
      </div>
    </article>
  `;
}

export function renderSelectedAdaptations(site: SiteData, collections: Collection[]): string {
  const section = site.selectedAdaptations;
  const items = getSelectedAdaptations(site, collections);

  if (!section || !items.length) {
    return "";
  }

  const eyebrow = cleanText(section.eyebrow, "Selected adaptations");
  const title = cleanText(section.title, "Selected Adaptations");
  const description = cleanText(
    section.description,
    "A focused shortlist of series and source types that best represent the adaptation work behind these LoRA collections.",
  );

  return `
    <section class="section" id="selected-adaptations">
      <div class="section__inner">
        <div class="section-heading section-heading--row">
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <p class="selected-adaptations__intro">${escapeHtml(description)}</p>
        </div>
        <div class="selected-adaptations-grid">
          ${items.map(renderCard).join("")}
        </div>
      </div>
    </section>
  `;
}
