import type { SiteData } from "../types/site";
import { escapeHtml } from "../lib/dom";

export function renderWhatIPublish(site: SiteData): string {
  return `
    <section class="section section--compact" id="what-i-publish">
      <div class="section__inner">
        <div class="manifesto">
          <div class="section-heading manifesto__heading">
            <p class="eyebrow">${escapeHtml(site.whatIPublish.eyebrow)}</p>
            <h2>${escapeHtml(site.whatIPublish.title)}</h2>
          </div>
          <ol class="manifesto__list">
            ${site.whatIPublish.statements
              .map(
                (statement, index) => `
                  <li class="manifesto__item">
                    <span class="manifesto__index">${String(index + 1).padStart(2, "0")}</span>
                    <p>${escapeHtml(statement)}</p>
                  </li>
                `,
              )
              .join("")}
          </ol>
        </div>
      </div>
    </section>
  `;
}
