# LetterForge

LetterForge is an original, static-first English word tool website for word unscrambling, anagram solving, word finding, Wordle-style filtering, dictionary checking, random word generation, SEO word-list pages, and blog content.

## Install

No runtime dependencies are required. You only need Node.js 20 or newer.

```bash
node --version
```

## Local development

Generate the static pages:

```bash
node scripts/generate-site.mjs
```

Run the local server:

```bash
node scripts/dev-server.mjs
```

Open `http://localhost:4173`.

## Build

The build step is the generator:

```bash
npm run build
```

If npm is unavailable, run:

```bash
node scripts/generate-site.mjs
```

## Verify

```bash
npm run check
```

Or:

```bash
node scripts/check-site.mjs
```

## Deployment

The site is static and can deploy to Netlify, Vercel, or GitHub Pages. Netlify can use `_redirects`; Vercel can use `vercel.json`. The `/word/[word]` route rewrites to `/word/index.html`, where client-side JavaScript reads the URL and renders the word detail page.

## Replacing the word list

The active word list is `data/words.json`, generated from `scripts/generate-site.mjs`. Replace it with a larger open or licensed list using lowercase alphabetic words. Do not market the site as using an official game dictionary unless you have actually licensed and connected that data.

The search logic lives in `assets/app.js`:

- input cleanup
- wildcard handling for `?` and `*`
- letter frequency matching
- prefix, suffix, must-include, length, and exact anagram filters
- Scrabble-style scoring

## Adding AdSense

Ad placeholders use `.ad-slot` and `data-ad-slot` attributes. Replace the placeholder markup or add one central ad loader in `assets/app.js`. Keep ads below or beside the primary tool so the first interaction remains fast.

## Adding SEO pages

Add a new route in `scripts/generate-site.mjs` with `writePage()`. Use the existing `layout()`, `seoListPage()`, or `smallToolPage()` helpers so each page includes:

- unique title
- meta description
- canonical URL
- H1
- Open Graph and Twitter Card tags
- WebSite, WebApplication, BreadcrumbList, and FAQPage JSON-LD

Then regenerate the site and update `sitemap.xml` through the same script.
