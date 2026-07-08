import "./styles/index.css";
import { renderCaseStudies, renderCommissionCta } from "./components/caseStudies";
import { renderCollectionCards } from "./components/collectionCards";
import { renderHero } from "./components/hero";
import { ShowcaseGallery } from "./components/showcaseGallery";
import { renderFocus, renderStats } from "./components/stats";
import { renderWorkflow } from "./components/workflow";
import { renderBrandLabel } from "./lib/brandIcons";
import { loadData } from "./lib/data";
import { getRequiredElement, setImageFallbacks } from "./lib/dom";
import type { Collection, ShowcaseItem } from "./types/site";

function getFeaturedLora(
  collections: Collection[],
  featured?: { collectionId: string; itemId: string },
): { collection: Collection | undefined; item: ShowcaseItem | undefined } {
  const configuredCollection = collections.find((collection) => collection.id === featured?.collectionId);
  const configuredItem = configuredCollection?.showcase.find((item) => item.id === featured?.itemId);

  if (configuredCollection && configuredItem) {
    return { collection: configuredCollection, item: configuredItem };
  }

  const fallbackCollection = collections.find((collection) => collection.showcase.length > 0) ?? collections[0];
  return {
    collection: fallbackCollection,
    item: fallbackCollection?.showcase[0],
  };
}

function boot(): void {
  const app = getRequiredElement<HTMLElement>("#app");

  try {
    const { site, collections } = loadData();
    const featured = getFeaturedLora(collections, site.featured);

    app.innerHTML = `
      ${renderHero(site, featured.collection, featured.item)}
      <main>
        ${renderFocus(site)}
        ${renderStats(site)}
        ${renderCollectionCards(collections, site.ratingModes)}
        <section class="section section--showcase" id="showcase"></section>
        ${renderWorkflow(site)}
        ${renderCaseStudies(site)}
        ${renderCommissionCta(site)}
      </main>
      <footer class="footer">
        <div class="section__inner footer__inner">
          <div>
            <strong>${site.creator.name}</strong>
            <p>Showcased characters belong to their respective owners. This portfolio only presents LoRA training examples and links to original posts when available.</p>
          </div>
          <nav aria-label="Footer links">
            <a href="${site.creator.links.civitai}" target="_blank" rel="noreferrer">${renderBrandLabel("civitai", "CivitAI")}</a>
            <a href="${site.creator.links.kofi}" target="_blank" rel="noreferrer">${renderBrandLabel("kofi", "Ko-fi")}</a>
            <a href="${site.creator.links.pixiv}" target="_blank" rel="noreferrer">${renderBrandLabel("pixiv", "Pixiv")}</a>
            <a href="${site.creator.links.github}" target="_blank" rel="noreferrer">${renderBrandLabel("github", "GitHub")}</a>
          </nav>
        </div>
      </footer>
    `;

    const gallery = new ShowcaseGallery(
      getRequiredElement<HTMLElement>("#showcase"),
      collections,
      site.ratingModes,
      site.sourceTypes,
    );
    gallery.init();

    document.querySelectorAll<HTMLButtonElement>("[data-view-collection]").forEach((button) => {
      button.addEventListener("click", () => {
        const collectionId = button.dataset.viewCollection;
        if (collectionId) {
          gallery.setCollection(collectionId);
        }
      });
    });

    setImageFallbacks();
  } catch (error) {
    console.error(error);
    app.innerHTML = `
      <main class="error-page">
        <section class="empty-state">
          <p class="eyebrow">Content error</p>
          <h1>The portfolio data could not be loaded.</h1>
          <p>Check the JSON files in <code>src/data</code> and run the build again.</p>
        </section>
      </main>
    `;
  }
}

boot();
