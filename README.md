# Zetsubou's IL LoRA Showcase

A static Vite + TypeScript portfolio for Illustrious / IL character LoRA showcase images. It is designed for GitHub Pages and is updated by editing JSON files and adding image files under `public/assets/img`.

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

## Change Profile Links

Edit `src/data/site.json`.

Update:

- `creator.links.civitai`
- `creator.links.kofi`
- `creator.links.pixiv`
- `creator.links.github`
- `creator.name`
- `creator.handle`

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

Each collection can link to CivitAI with `civitaiUrl`.

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

The rating toggle shows the exact selected rating when available. If an item is missing that rating, the gallery keeps the LoRA visible and shows a placeholder image for the missing slot. Use the local admin app to replace missing `PG`, `PG-13`, or `R` images from a CivitAI image URL.

## Deploy To GitHub Pages

The workflow is in `.github/workflows/deploy.yml`.

Before deploying, check `vite.config.ts`:

```ts
base: process.env.NODE_ENV === "production" ? "/ko-fi-portofolio/" : "/";
```

If the repository name changes, replace `ko-fi-portofolio` with the actual GitHub repository name.

In GitHub:

1. Open repository settings.
2. Go to Pages.
3. Set source to GitHub Actions.
4. Push to `main`.

The workflow installs dependencies, builds with Vite, uploads `dist`, and deploys it to GitHub Pages.
