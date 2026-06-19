import type { SiteData } from "../types/site";
import { renderBrandLabel } from "../lib/brandIcons";
import { escapeHtml } from "../lib/dom";

export function renderCaseStudies(site: SiteData): string {
  return `
    <section class="section" id="case-studies">
      <div class="section__inner">
        <div class="section-heading">
          <p class="eyebrow">Case studies</p>
          <h2>Portfolio notes for difficult LoRA scenarios</h2>
        </div>
        <div class="case-grid">
          ${site.caseStudies
            .map(
              (study) => `
                <article class="case-card">
                  <h3>${escapeHtml(study.title)}</h3>
                  <p>${escapeHtml(study.description)}</p>
                  <div class="chip-row">
                    ${study.tags.map((tag) => `<span class="chip chip--muted">${escapeHtml(tag)}</span>`).join("")}
                  </div>
                </article>
              `,
            )
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
          <p class="eyebrow">Commissions</p>
          <h2>Commission paths for public and private IL character LoRAs</h2>
          <p class="cta__note">Choose a public release if you want it shared on CivitAI, or private delivery if the LoRA is only for your own use.</p>
          <div class="cta__actions">
            <a class="button button--primary" href="${escapeHtml(site.creator.links.kofi)}" target="_blank" rel="noreferrer">Visit my Ko-fi page</a>
          </div>
        </div>
        <div class="commission-grid">
          ${site.commissions
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
