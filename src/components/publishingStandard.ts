import type { SiteData } from "../types/site";
import { escapeHtml } from "../lib/dom";

export function renderPublishingStandard(site: SiteData): string {
  return `
    <section class="section" id="publishing-standard">
      <div class="section__inner publishing-standard">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(site.publishingStandard.eyebrow)}</p>
          <h2>${escapeHtml(site.publishingStandard.title)}</h2>
        </div>
        <div class="standard-board">
          <ul class="standard-list">
            ${site.publishingStandard.items
              .map(
                (item) => `
                  <li>
                    <span class="standard-list__mark" aria-hidden="true"></span>
                    <span>${escapeHtml(item)}</span>
                  </li>
                `,
              )
              .join("")}
          </ul>
          <p class="standard-board__note">${escapeHtml(site.publishingStandard.note)}</p>
        </div>
      </div>
    </section>
  `;
}
