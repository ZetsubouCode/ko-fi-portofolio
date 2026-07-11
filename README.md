# Zetsubou's Character LoRA Archive

A static Vite + TypeScript portfolio for Zetsubou's curated character adaptation archive: canon-aware anime-style Illustrious LoRAs for overlooked characters, difficult source material, and designs that need honest source-aware handling.

The site is built for GitHub Pages and is mostly edited through JSON files plus image assets under `public/assets/img`.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview The Build

```bash
npm run preview
```

## Edit Site Copy

Most public positioning lives in `src/data/site.json`.

- Hero eyebrow, title, and lead: `creator.eyebrow`, `creator.title`, `creator.description`
- Profile links: `creator.links`
- What I Publish section: `whatIPublish`
- Creator pillars: `focusCards`
- Publishing checklist: `publishingStandard`
- Case studies: `caseStudies`
- Ko-fi commission workflow heading, lead, steps, and notes: `workflow`
- Commission availability text and cards: `commissions`
- Rating modes: `ratingModes`
- Featured hero LoRA: `featured.collectionId` and `featured.itemId`

## Mark Selected Adaptations

Selected Adaptations are controlled from `src/data/collections.json`.

Add these optional fields to a collection:

```json
{
  "portfolioFeatured": true,
  "portfolioOrder": 1,
  "portfolioReason": "Manga-to-anime adaptation"
}
```

Use `portfolioOrder` to control the card order. Use `portfolioReason` for a short truthful line such as `Limited source coverage`, `Canon outfit focus`, `Side-character archive entry`, or `Low-resource design study`.

If fewer than six collections are marked, the component fills the remaining slots from existing collections so the section does not break.

## Add A New Collection

Edit `src/data/collections.json` and add one collection object.

Required fields:

- `id`: lowercase kebab-case, also used for deep links like `/#collection-id`
- `title`
- `series`
- `sourceType`
- `modelType`
- `status`
- `cover`
- `description`
- `highlights`
- `trainingNotes`
- `tags`
- `showcase`

Each collection can link to CivitAI with `civitaiUrl`. Keep collection descriptions public-facing; avoid import notes, local file maintenance notes, or claims that are not supported by the source data.

## Add Images

Use this structure:

```text
public/
  assets/
    img/
      covers/
        collection-id.webp
      collections/
        collection-id/
          thumb/
            default-pg.webp
            default-pg13.webp
          full/
            default-pg.webp
            default-pg13.webp
```

Recommended image rules:

- Use `.webp`.
- Use thumbnails in `thumb`.
- Use full-size images in `full`.
- Keep file names lowercase and kebab-case.
- Portrait images around `4:7` work best.

The gallery grid loads thumbnails. Full images are only loaded when a lightbox preview opens.

## Add A Showcase Item

Inside a collection's `showcase` array:

```json
{
  "id": "default-outfit",
  "title": "Default Outfit",
  "description": "Main showcase for canon outfit accuracy.",
  "tags": ["canon look", "default outfit"],
  "variants": {
    "pg": {
      "thumb": "/assets/img/collections/example-character/thumb/default-pg.webp",
      "full": "/assets/img/collections/example-character/full/default-pg.webp",
      "alt": "Example character in default outfit, PG showcase image"
    }
  }
}
```

## Add A Rating Variant

Rating modes live in `src/data/site.json`.

Default modes:

```json
[
  { "id": "pg", "label": "PG", "level": 1 },
  { "id": "pg13", "label": "PG-13", "level": 2 },
  { "id": "r", "label": "R", "level": 3 }
]
```

To add another level such as `R-15`, add:

```json
{ "id": "r15", "label": "R-15", "level": 4 }
```

Then add matching showcase variants:

```json
"r15": {
  "thumb": "/assets/img/collections/example-character/thumb/default-r15.webp",
  "full": "/assets/img/collections/example-character/full/default-r15.webp",
  "alt": "Example character R-15 showcase image"
}
```

The rating toggle shows the exact selected rating when available. If an item is missing that rating, the gallery keeps the LoRA visible and shows a placeholder image for the missing slot.

## Deploy To GitHub Pages

The workflow is in `.github/workflows/deploy.yml`.

Before deploying, check `vite.config.ts`:

```ts
base: process.env.NODE_ENV === "production" ? "/ko-fi-portofolio/" : "/";
```

Do not change the base path unless the repository name changes.

In GitHub:

1. Open repository settings.
2. Go to Pages.
3. Set source to GitHub Actions.
4. Push to `main`.

The workflow installs dependencies, builds with Vite, uploads `dist`, and deploys it to GitHub Pages.
