# Azrul Space portfolio

React 19 + Vite + Unframer. The local composition was reconciled with **Portofolio Azrul (copy)**, project `LGMJfXafewgZRINIed43`, main branch, on 12 November 2026.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed in the terminal, normally http://127.0.0.1:5173. Keep the terminal running; Control+C stops it.

```sh
npm run check
npm run build
npm run preview
```

`check` validates the nine routes, actual exported variant IDs, eight breakpoint boundary widths, section-link repair, and server-renders all 27 page/breakpoint combinations (148 components). It does not replace browser testing. Results and upstream warnings are saved in `verification/render-checks.json`.

## Page composition

- Home: Hero → Dribbble shots → Why Me → Featured Works → Difference → Blogs → FAQ → Testimonials → DesignLagi → Footer.
- Works: Works Hero (including its gallery) → five featured projects → Blogs → Testimonials → Footer.
- About: About Hero → Short Story → What I Do → Integration Tools → Contact → Footer.
- Vibe: full-height Coming Soon with fixed navigation; no footer or contact section.
- Nurri, HastyHire, Agenticas, Eduqat AI Course, Eduqat Assignment: fixed case-study header → corresponding hero → full case-study body → back-to-top → Footer. Tablet/phone use the source's floating content panel.

All nine original URLs are retained. Desktop begins at 1440px, tablet at 810px, and phone below 810px. Native exported variants are selected directly, avoiding the export wrapper's different 768/1200px breakpoints. Original fonts, imagery, content, and internal component layouts are preserved.

## Source files

- `reference/framer-pages.json`: read-only Framer snapshot of all pages and three breakpoints.
- `scripts/prepare-layout.py`: maps source component instances to local exports, preserving variants, sizes, and relevant controls. Run `npm run layout:prepare` after updating the snapshot/mapping.
- `src/framer-layout.json`: generated page composition consumed by the app.
- `src/pages.js`: page titles.
- `src/App.jsx`: page renderer, fixed headers, responsive selection, original Smooth Scroll component and floating case-study panels.
- `src/links.js`: restores section destinations dropped by Unframer and matches case-study menu labels to real headings.
- `src/styles.css`: page-level layout only.

Duplicate overlapping footer/header layers and a stray off-canvas image on the Nurri source page are not rendered twice. Absolute canvas positions are translated to document flow; measured Home overlaps/gaps and Works group spacing are retained. Component content is not rewritten.

## Refresh exports

```sh
npm run framer:sync
npm run framer:extras
npm run check
npm run build
```

The original export remains in `framer/`. `framer-extra/` is generated from the versioned URLs in `unframer.config.json`: the correct Eduqat case-study component (`wP_zHj5gc`, not the empty similarly named `lBwfwUsZI`) and the original Smooth Scroll component. Agenticas uses `content-details-hastyhire-2`, matching the component actually placed on that Framer page.

Do not hand-edit generated export files. When the extra components change in Framer, refresh their versioned URLs from Framer before exporting. Reopen the React Export plugin when changing its component selection, pages or breakpoints.

## Verification and remaining review

- Production build passes. The Eduqat case-study chunk is large (about 917 kB minified); it is lazy-loaded only when needed.
- All 27 page/breakpoint render checks pass; original generated code still emits React prop/ref warnings and an empty-image-source warning.
- Reference screenshots were inspected for Home phone/tablet, Works desktop, About desktop, Vibe desktop and Agenticas desktop. Some very long case-study screenshot requests failed in Framer.
- **Local browser visual verification is incomplete:** browser connection was unavailable, and native browser access timed out. Mobile menu interactions, scroll effects, exact spacing at intermediate widths and page-to-page visual comparisons still need browser review. Server-side render checks do not measure layout or execute these interactions.
- Form delivery/booking actions have not been submitted. Contact remains on About as in Framer.
- Page-level Framer entrance effects and scroll-triggered variant effects may still differ outside Framer; internal exported animations are preserved. Floating panels retain source controls; copied source labels/destinations that cannot be matched to actual headings still need review.
- Media and fonts load from their original online sources.

Build output is `dist/`. A future static host must fall back to `index.html` for page routes. Nothing has been published or changed in the Framer source project.
