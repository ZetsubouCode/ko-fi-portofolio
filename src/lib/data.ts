import collectionsJson from "../data/collections.json";
import siteJson from "../data/site.json";
import type { Collection, SiteData } from "../types/site";

export type AppData = {
  site: SiteData;
  collections: Collection[];
};

export function loadData(): AppData {
  const site = siteJson as SiteData;
  const collections = collectionsJson as Collection[];

  if (
    !site.creator ||
    !Array.isArray(site.ratingModes) ||
    site.ratingModes.length === 0
  ) {
    throw new Error("site.json is missing creator data or rating modes.");
  }

  if (
    !site.whatIPublish ||
    !Array.isArray(site.whatIPublish.statements) ||
    !site.publishingStandard ||
    !Array.isArray(site.publishingStandard.items) ||
    !site.workflow ||
    !Array.isArray(site.workflow.steps) ||
    !site.commissions ||
    !Array.isArray(site.commissions.items)
  ) {
    throw new Error("site.json is missing required portfolio section data.");
  }

  if (!Array.isArray(collections)) {
    throw new Error("collections.json must contain an array of collections.");
  }

  return { site, collections };
}

export function getAllTags(collections: Collection[]): string[] {
  const tags = new Set<string>();

  collections.forEach((collection) => {
    collection.tags.forEach((tag) => tags.add(tag));
    collection.showcase.forEach((item) =>
      item.tags.forEach((tag) => tags.add(tag)),
    );
  });

  return [...tags].sort((a, b) => a.localeCompare(b));
}
