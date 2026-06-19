import type { SiteData } from "../types/site";
import { escapeHtml } from "../lib/dom";

export function renderWorkflow(site: SiteData): string {
  return `
    <section class="section" id="workflow">
      <div class="section__inner">
        <div class="section-heading">
          <p class="eyebrow">Training workflow</p>
          <h2>From source review to delivery notes</h2>
        </div>
        <ol class="timeline">
          ${site.workflow
            .map(
              (step, index) => `
                <li class="timeline__item">
                  <span class="timeline__index">${String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>${escapeHtml(step.title)}</h3>
                    <p>${escapeHtml(step.description)}</p>
                  </div>
                </li>
              `,
            )
            .join("")}
        </ol>
      </div>
    </section>
  `;
}
