export type RatingMode = {
  id: string;
  label: string;
  level: number;
};

export type ImageVariant = {
  thumb: string;
  full: string;
  alt: string;
  isPlaceholder?: boolean;
  ratingId?: string;
};

export type ShowcaseItem = {
  id: string;
  title: string;
  description: string;
  civitaiUrl?: string;
  civitaiModelId?: number;
  civitaiVersionId?: number;
  civitaiVersionName?: string;
  tags: string[];
  variants: Record<string, ImageVariant>;
};

export type FeaturedLora = {
  collectionId: string;
  itemId: string;
};

export type SelectedAdaptationItem = {
  collectionId: string;
  active?: boolean;
  order?: number;
  title?: string;
  description?: string;
  whyMatters?: string;
  notes?: string[];
  tags?: string[];
  ctaLabel?: string;
};

export type SelectedAdaptationsContent = {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: SelectedAdaptationItem[];
};

export type SourceType = {
  id: string;
  label: string;
  active?: boolean;
};

export type Collection = {
  id: string;
  title: string;
  series: string;
  sourceType: string;
  modelType: string;
  status: string;
  cover: string;
  civitaiUrl?: string;
  description: string;
  portfolioFeatured?: boolean;
  portfolioOrder?: number;
  portfolioReason?: string;
  highlights: string[];
  trainingNotes: string[];
  tags: string[];
  showcase: ShowcaseItem[];
};

export type CreatorLinks = {
  civitai: string;
  kofi: string;
  github: string;
  pixiv: string;
};

export type Creator = {
  name: string;
  handle: string;
  eyebrow?: string;
  title: string;
  description: string;
  links: CreatorLinks;
};

export type Stat = {
  label: string;
  value: string;
};

export type FeatureCard = {
  title: string;
  description: string;
};

export type WhatIPublish = {
  eyebrow: string;
  title: string;
  statements: string[];
};

export type WorkflowStep = {
  title: string;
  description: string;
};

export type WorkflowContent = {
  eyebrow: string;
  title: string;
  lead: string;
  steps: WorkflowStep[];
  notes?: string[];
};

export type CaseStudy = {
  title: string;
  subtitle: string;
  problem: string;
  focus: string;
  watchOut: string;
  tags: string[];
  collectionId?: string;
  image?: string;
};

export type PublishingStandard = {
  eyebrow: string;
  title: string;
  items: string[];
  note: string;
};

export type CommissionContent = {
  eyebrow: string;
  title: string;
  lead: string;
  note: string;
  items: CommissionItem[];
};

export type CommissionItem = {
  title: string;
  description: string;
  url: string;
};

export type SiteData = {
  creator: Creator;
  featured?: FeaturedLora;
  selectedAdaptations?: SelectedAdaptationsContent;
  sourceTypes?: SourceType[];
  stats: Stat[];
  ratingModes: RatingMode[];
  whatIPublish: WhatIPublish;
  focusCards: FeatureCard[];
  workflow: WorkflowContent;
  publishingStandard: PublishingStandard;
  caseStudies: CaseStudy[];
  commissions: CommissionContent;
};
