import type { SiteData } from "../types/site";
import { escapeHtml } from "../lib/dom";

export function renderWorkflow(site: SiteData): string {
  return `
    <section class="section" id="workflow">
      <div class="section__inner">
        <div class="section-heading">
          <p class="eyebrow">${escapeHtml(site.workflow.eyebrow)}</p>
          <h2>${escapeHtml(site.workflow.title)}</h2>
          <p>${escapeHtml(site.workflow.lead)}</p>
        </div>
        <ol class="timeline">
          ${site.workflow.steps
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
        ${
          site.workflow.notes?.length
            ? `<div class="workflow-notes">
                ${site.workflow.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("")}
              </div>`
            : ""
        }
      </div>
    </section>
  `;
}
