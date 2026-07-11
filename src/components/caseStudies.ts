import type { SiteData } from "../types/site";
import type { Collection } from "../types/site";
import { getAssetUrl } from "../lib/assets";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml } from "../lib/dom";

export function renderCaseStudies(
  site: SiteData,
  collections: Collection[],
): string {
  return `
    <section class="section" id="case-studies">
      <div class="section__inner">
        <div class="section-heading">
          <p class="eyebrow">Difficult Character Studies</p>
          <h2>Hard cases I build around</h2>
          <p>Some characters are messy by default: low references, greyscale panels, unstable outfit details, or source styles that fight the target output. These are the cases I pay extra attention to before publishing.</p>
        </div>
        <div class="case-grid">
          ${site.caseStudies
            .map((study) => {
              const linkedCollection = study.collectionId
                ? collections.find(
                    (collection) => collection.id === study.collectionId,
                  )
                : undefined;

              return `
                <article class="case-card">
                  ${
                    study.image
                      ? `<div class="image-shell case-card__image"><img src="${escapeHtml(getAssetUrl(study.image))}" alt="${escapeHtml(study.title)} case study image" loading="lazy" decoding="async" /><span class="image-placeholder">Case study image placeholder</span></div>`
                      : ""
                  }
                  <h3>${escapeHtml(study.title)}</h3>
                  <p class="case-card__subtitle">${escapeHtml(study.subtitle)}</p>
                  <div class="case-card__block">
                    <span class="case-card__label">Problem</span>
                    <p>${escapeHtml(study.problem)}</p>
                  </div>
                  <div class="case-card__block">
                    <span class="case-card__label">My Focus</span>
                    <p>${escapeHtml(study.focus)}</p>
                  </div>
                  <div class="case-card__block">
                    <span class="case-card__label">Watch Out</span>
                    <p>${escapeHtml(study.watchOut)}</p>
                  </div>
                  <div class="chip-row">
                    ${study.tags.map((tag) => `<span class="chip chip--muted">${escapeHtml(tag)}</span>`).join("")}
                  </div>
                  ${
                    linkedCollection
                      ? `<button class="button button--ghost button--sm" type="button" data-view-collection="${escapeHtml(linkedCollection.id)}">View ${escapeHtml(linkedCollection.title)}</button>`
                      : ""
                  }
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function renderCommissionCta(site: SiteData): string {
  return `
    <section class="section" id="commissions">
      <div class="section__inner cta">
        <div>
          <p class="eyebrow">${escapeHtml(site.commissions.eyebrow)}</p>
          <h2>${escapeHtml(site.commissions.title)}</h2>
          <p class="cta__note">${escapeHtml(site.commissions.lead)}</p>
          <p class="cta__subnote">${escapeHtml(site.commissions.note)}</p>
          <div class="cta__actions">
            <a class="button button--primary" href="${escapeHtml(site.creator.links.kofi)}" target="_blank" rel="noreferrer">Visit my Ko-fi page</a>
          </div>
        </div>
        <div class="commission-grid">
          ${site.commissions.items
            .map(
              (item) => `
                <a class="commission-card" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.description)}</p>
                  <span class="commission-card__cta">${renderBrandLabel("kofi", "Open Ko-fi")}</span>
                </a>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
