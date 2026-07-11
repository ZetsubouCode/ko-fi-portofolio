import { getAssetUrl } from "../lib/assets";
import { escapeHtml } from "../lib/dom";
import type {
  Collection,
  SelectedAdaptationItem,
  SelectedAdaptationsContent,
} from "../types/site";

type ResolvedSelectedAdaptation = {
  collection: Collection;
  item: SelectedAdaptationItem;
};

function textOrFallback(value: unknown, fallback: string): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const text = String(value ?? "").trim();
    const key = text.toLowerCase();

    if (!text || seen.has(key)) {
      return;
    }

    seen.add(key);
    output.push(text);
  });

  return output;
}

function orderValue(item: SelectedAdaptationItem): number {
  const order = Number(item.order);
  return Number.isFinite(order) ? order : 999;
}

function resolveSelectedAdaptations(
  selectedAdaptations: SelectedAdaptationsContent | undefined,
  collections: Collection[],
): ResolvedSelectedAdaptation[] {
  if (
    !selectedAdaptations ||
    selectedAdaptations.enabled === false ||
    !Array.isArray(selectedAdaptations.items)
  ) {
    return [];
  }

  const collectionById = new Map(
    collections.map((collection) => [collection.id, collection]),
  );
  const usedCollectionIds = new Set<string>();

  return selectedAdaptations.items
    .filter((item) => item?.active !== false)
    .sort(
      (a, b) =>
        orderValue(a) - orderValue(b) ||
        String(a.collectionId || "").localeCompare(String(b.collectionId || "")),
    )
    .flatMap((item) => {
      const collectionId = String(item.collectionId || "").trim();
      const collection = collectionById.get(collectionId);

      if (!collection || usedCollectionIds.has(collectionId)) {
        return [];
      }

      usedCollectionIds.add(collectionId);
      return [{ collection, item }];
    });
}

function getTags(
  item: SelectedAdaptationItem,
  collection: Collection,
): string[] {
  const configuredTags = uniqueStrings(Array.isArray(item.tags) ? item.tags : []);

  if (configuredTags.length > 0) {
    return configuredTags;
  }

  return uniqueStrings([
    ...(Array.isArray(collection.highlights) ? collection.highlights : []),
    ...(Array.isArray(collection.tags) ? collection.tags : []),
  ]).slice(0, 6);
}

function renderNotes(notes: string[] | undefined): string {
  const normalizedNotes = uniqueStrings(Array.isArray(notes) ? notes : []);

  if (normalizedNotes.length === 0) {
    return "";
  }

  return `
    <ul class="selected-card__notes">
      ${normalizedNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
    </ul>
  `;
}

function renderSelectedCard({
  collection,
  item,
}: ResolvedSelectedAdaptation): string {
  const title = textOrFallback(item.title, collection.title);
  const description = textOrFallback(item.description, collection.description);
  const whyMatters = String(item.whyMatters || "").trim();
  const ctaLabel = textOrFallback(item.ctaLabel, "View collection");
  const tags = getTags(item, collection);

  return `
    <article class="selected-card">
      <div class="image-shell selected-card__media">
        <img src="${escapeHtml(getAssetUrl(collection.cover))}" alt="${escapeHtml(collection.title)} cover" loading="lazy" decoding="async" />
        <span class="image-placeholder">Selected adaptation image placeholder</span>
      </div>
      <div class="selected-card__body">
        <div class="selected-card__meta">
          <span>${escapeHtml(collection.series)}</span>
          <span>${escapeHtml(collection.sourceType)}</span>
          <span>${escapeHtml(collection.status)}</span>
        </div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        ${
          whyMatters
            ? `<p class="selected-card__reason"><strong>Why it matters:</strong> ${escapeHtml(whyMatters)}</p>`
            : ""
        }
        ${renderNotes(item.notes)}
        <div class="chip-row">
          ${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="selected-card__actions">
          <button class="button button--ghost button--sm" type="button" data-view-collection="${escapeHtml(collection.id)}">${escapeHtml(ctaLabel)}</button>
        </div>
      </div>
    </article>
  `;
}

export function renderSelectedAdaptations(
  selectedAdaptations: SelectedAdaptationsContent | undefined,
  collections: Collection[],
): string {
  const selected = resolveSelectedAdaptations(selectedAdaptations, collections);

  if (selected.length === 0) {
    return "";
  }

  return `
    <section class="section" id="selected-adaptations">
      <div class="section__inner">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(textOrFallback(selectedAdaptations?.eyebrow, "Selected adaptations"))}</p>
          <h2>${escapeHtml(textOrFallback(selectedAdaptations?.title, "Selected Adaptations"))}</h2>
          ${
            selectedAdaptations?.description
              ? `<p>${escapeHtml(selectedAdaptations.description)}</p>`
              : ""
          }
        </div>
        <div class="selected-grid">
          ${selected.map((entry) => renderSelectedCard(entry)).join("")}
        </div>
      </div>
    </section>
  `;
}
