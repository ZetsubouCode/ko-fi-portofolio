import type { Collection, ShowcaseItem, SiteData } from "../types/site";
import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml } from "../lib/dom";

function getFeaturedImage(collection: Collection | undefined, item: ShowcaseItem | undefined): string {
  return (
    item?.variants.pg?.thumb ||
    item?.variants.pg?.full ||
    item?.variants.pg13?.thumb ||
    item?.variants.pg13?.full ||
    item?.variants.r?.thumb ||
    item?.variants.r?.full ||
    collection?.cover ||
    "/assets/img/covers/manga-side-character.webp"
  );
}

export function renderHero(
  site: SiteData,
  featuredCollection: Collection | undefined,
  featuredItem?: ShowcaseItem,
): string {
  const cover = getAssetUrl(getFeaturedImage(featuredCollection, featuredItem));
  const title = featuredItem?.title ?? featuredCollection?.title ?? "Featured LoRA";
  const series = featuredCollection
    ? `${featuredCollection.title}${featuredItem ? ` / ${featuredCollection.series}` : ""}`
    : "Portfolio sample";
  const ratingLabels = site.ratingModes.map((mode) => mode.label).join(" / ");

  return `
    <section class="hero section" id="top">
      <div class="hero__particles" aria-hidden="true"></div>
      <div class="section__inner hero__inner">
        <div class="hero__copy">
          <p class="eyebrow">@${escapeHtml(site.creator.handle)}</p>
          <h1>${escapeHtml(site.creator.title)}</h1>
          <p class="hero__lead">${escapeHtml(site.creator.description)}</p>
          <div class="hero__actions">
            <a class="button button--primary" href="${escapeHtml(site.creator.links.kofi)}" target="_blank" rel="noreferrer">${renderBrandLabel("kofi", "Ko-fi")}</a>
            <a class="button button--secondary button--social" href="${escapeHtml(site.creator.links.civitai)}" target="_blank" rel="noreferrer">${renderBrandLabel("civitai", "CivitAI")}</a>
            <a class="button button--secondary button--social" href="${escapeHtml(site.creator.links.pixiv)}" target="_blank" rel="noreferrer">${renderBrandLabel("pixiv", "Pixiv")}</a>
            <a class="button button--ghost" href="#showcase">Browse Showcase</a>
          </div>
        </div>
        <article class="hero-card" aria-label="Featured collection preview">
          <div class="hero-card__glow" aria-hidden="true"></div>
          <div class="image-shell hero-card__image">
            <img src="${escapeHtml(cover)}" alt="${escapeHtml(title)} cover" fetchpriority="high" decoding="async" />
            <span class="image-placeholder">Cover image placeholder</span>
          </div>
          <div class="hero-card__body">
            <p class="eyebrow">Featured LoRA</p>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(series)}</p>
            <div class="chip-row" aria-label="Rating preview">
              ${site.ratingModes
                .map((mode) => `<span class="chip">${escapeHtml(mode.label)}</span>`)
                .join("")}
            </div>
            <p class="hero-card__note">Rating modes: ${escapeHtml(ratingLabels)}</p>
          </div>
        </article>
      </div>
    </section>
  `;
}
