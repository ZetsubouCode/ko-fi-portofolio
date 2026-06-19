import type { Collection, ShowcaseItem, SiteData } from "../types/site";
import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml } from "../lib/dom";

const heroPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'%3E%3Crect width='800' height='1000' fill='%23181722'/%3E%3Ctext x='400' y='500' text-anchor='middle' fill='%23d6a85f' font-family='Arial,sans-serif' font-size='48' font-weight='700'%3ELoRA Showcase%3C/text%3E%3C/svg%3E";

function getFeaturedImage(collection: Collection | undefined, item: ShowcaseItem | undefined): string {
  return (
    item?.variants.pg?.thumb ||
    item?.variants.pg?.full ||
    item?.variants.pg13?.thumb ||
    item?.variants.pg13?.full ||
    item?.variants.r?.thumb ||
    item?.variants.r?.full ||
    collection?.cover ||
    heroPlaceholder
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
            <a class="button button--primary" href="#commissions">Commission Options</a>
            <a class="button button--secondary" href="#showcase">View LoRA Gallery</a>
          </div>
          <div class="hero__profile-links">
            <a class="hero__profile-link" href="${escapeHtml(site.creator.links.kofi)}" target="_blank" rel="noreferrer">${renderBrandLabel("kofi", "Ko-fi")}</a>
            <a class="hero__profile-link" href="${escapeHtml(site.creator.links.civitai)}" target="_blank" rel="noreferrer">${renderBrandLabel("civitai", "CivitAI")}</a>
            <a class="hero__profile-link" href="${escapeHtml(site.creator.links.pixiv)}" target="_blank" rel="noreferrer">${renderBrandLabel("pixiv", "Pixiv")}</a>
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
