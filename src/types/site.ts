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

export type SelectedAdaptationsSection = {
  enabled?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  items: SelectedAdaptationItem[];
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

export type WorkflowStep = {
  title: string;
  description: string;
};

export type CaseStudy = {
  title: string;
  description: string;
  tags: string[];
};

export type CommissionItem = {
  title: string;
  description: string;
  url: string;
};

export type SiteData = {
  creator: Creator;
  featured?: FeaturedLora;
  selectedAdaptations?: SelectedAdaptationsSection;
  sourceTypes?: SourceType[];
  stats: Stat[];
  ratingModes: RatingMode[];
  focusCards: FeatureCard[];
  workflow: WorkflowStep[];
  caseStudies: CaseStudy[];
  commissions: CommissionItem[];
};
