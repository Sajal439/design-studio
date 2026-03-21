# Database Seeds

- `seed.ts` is the main Prisma seed entrypoint for baseline categories, sample records, and price-book data.
- `scripts/import-designs.ts` imports design records from `scripts/data/designs.json` and uploads matching files from `seed-images/`.
- `scripts/generate-design-manifest.ts` scans `seed-images/` and creates a draft manifest automatically.

## Commands

- `npm run db:seed` runs the main Prisma seed.
- `npm run db:generate:design-manifest` creates `scripts/data/designs.generated.json` from filenames in `seed-images/`.
- `npm run db:import:designs` imports design data from the JSON manifest.

## Fast Workflow

1. Download interior images into `seed-images/`.
2. Run `npm run db:generate:design-manifest`.
3. Review and edit `scripts/data/designs.generated.json`.
4. Copy approved entries into `scripts/data/designs.json`.
5. Run `npm run db:import:designs`.

See `scripts/data/designs.template.json` for a starter structure and `scripts/data/design-search-keywords.md` for sourcing keywords.
