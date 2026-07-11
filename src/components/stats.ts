import type { SiteData } from "../types/site";
import { escapeHtml } from "../lib/dom";

export function renderFocus(site: SiteData): string {
  return `
    <section class="section" id="focus">
      <div class="section__inner">
        <div class="section-heading">
          <p class="eyebrow">What Defines the Archive</p>
          <h2>Built around character identity, not upload volume.</h2>
        </div>
        <div class="feature-grid">
          ${site.focusCards
            .map(
              (card, index) => `
                <article class="feature-card">
                  <span class="feature-card__icon" aria-hidden="true">${renderIcon(index)}</span>
                  <h3>${escapeHtml(card.title)}</h3>
                  <p>${escapeHtml(card.description)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

export function renderStats(site: SiteData): string {
  return `
    <section class="section section--compact" id="experience">
      <div class="section__inner">
        <div class="stats-grid" aria-label="Experience highlights">
          ${site.stats
            .map((stat, index) => {
              const valueClass = /^\d[\d+%.,\s]*$/.test(stat.value)
                ? "stat-card__value"
                : "stat-card__value stat-card__value--text";

              return `
                <div class="stat-card">
                  <span class="stat-card__mark">${String(index + 1).padStart(2, "0")}</span>
                  <div class="stat-card__content">
                    <strong class="${valueClass}">${escapeHtml(stat.value)}</strong>
                    <span>${escapeHtml(stat.label)}</span>
                  </div>
                  <span class="stat-card__line" aria-hidden="true"></span>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderIcon(index: number): string {
  const paths = [
    '<path d="M7 28c4-12 14-18 30-18 11 0 18 5 20 15-5-4-11-6-18-6-14 0-24 4-32 9Z"/><path d="M14 38c10 8 24 10 38 1"/>',
    '<path d="M14 12h36v40H14z"/><path d="M22 23h20M22 33h14M22 43h20"/>',
    '<path d="M32 8 54 20v24L32 56 10 44V20z"/><path d="M21 25c7 5 15 5 22 0M24 38h16"/>',
    '<path d="M12 19h40v28H12z"/><path d="M20 27h24v12H20z"/><path d="M28 47l8 8"/>',
  ];

  return `<svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">${paths[index % paths.length]}</svg>`;
}
