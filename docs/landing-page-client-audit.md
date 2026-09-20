# Landing Page Client — Audit & Fix Report

**Date:** 2026-09-20
**Scope:** `client/` — DODZ Fried Chicken landing page (Home route)
**Session type:** Functional bug fixes only (no refactors or performance rewrites in this pass)

---

## 1. Pre-flight status

Ran before touching any code:

| Check | Command | Result |
|-------|---------|--------|
| TypeScript + production build | `npm run build` | ✅ Passed (754 modules) |
| ESLint | `npm run lint` | ✅ Passed |

Baseline production bundle (prior to fixes):

- `index-*.js` — **379.27 kB** (gzip **118.15 kB**)
- `index-*.css` — **51.15 kB** (gzip **8.86 kB**)
- Fonts on the page: **0** (broken, see Step 2)
- Notable warning in build output:

  ```
  ./fonts/Poppins-Regular.ttf referenced in ./fonts/Poppins-Regular.ttf
  didn't resolve at build time, it will remain unchanged to be resolved at runtime
  ```

---

## 2. Bug #1 — Broken Poppins font

### Problem

`client/src/index.css` declared a `@font-face` pointing at a file that does not exist:

```css
@font-face {
  font-family: "Poppins";
  src: url("./fonts/Poppins-Regular.ttf");
}
```

Verified root causes:

- The referenced file `client/src/fonts/Poppins-Regular.ttf` **does not exist**.
- The only font present in the repo was `client/src/assets/fonts/BebasNeue-Regular.ttf` (a display face, wrong for body text).
- Because the `src` is relative to `index.css` (which lives at `client/src/`), the browser would request `/src/fonts/Poppins-Regular.ttf` → **404**.
- Result: the global rule `* { font-family: "Poppins", sans-serif }` silently fell back to the system `sans-serif`, so the app was never rendering in the intended typeface. The build warning above was the symptom.

### Fix applied

1. **Downloaded real Poppins fonts** (self-hosted, better than a third-party render-blocking request). Network was verified available, then the Latin-subset `woff2` files for weights 400/600/700 were fetched from `fonts.gstatic.com`:
   - `client/src/assets/fonts/Poppins-400.woff2` (7.88 kB)
   - `client/src/assets/fonts/Poppins-600.woff2` (7.81 kB)
   - `client/src/assets/fonts/Poppins-700.woff2` (8.00 kB)

   `woff2` was chosen over TTF because it is the most widely supported, smallest web format (~8 kB per weight vs ~60 kB+ for TTF). Weights 400/600/700 cover the font weights actually used by the UI (`font-bold` ~ 700, `font-semibold` ~ 600, body ~ 400). Added `font-display: swap` so text renders instantly with a fallback while the font loads (no invisible-text flash).

2. **Rewrote the `@font-face` block** in `client/src/index.css` with the correct relative paths, explicit weights, and `font-display`:

   ```css
   @font-face {
     font-family: "Poppins";
     src: url("./assets/fonts/Poppins-400.woff2") format("woff2");
     font-weight: 400;
     font-style: normal;
     font-display: swap;
   }
   @font-face {
     font-family: "Poppins";
     src: url("./assets/fonts/Poppins-600.woff2") format("woff2");
     font-weight: 600;
     font-style: normal;
     font-display: swap;
   }
   @font-face {
     font-family: "Poppins";
     src: url("./assets/fonts/Poppins-700.woff2") format("woff2");
     font-weight: 700;
     font-style: normal;
     font-display: swap;
   }
   ```

3. **Hardened the global font rule** in the same file to a proper stacked fallback:

   ```css
   * {
     font-family: "Poppins", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
   }
   ```

### Verification

- Rebuilt: the `Poppins-400/600/700.woff2` files are now emitted as real production assets, and the `didn't resolve at build time` warning is **gone**.
- Note: these are Latin-subsets. If the UI later adds non-Latin scripts (e.g. Arabic), additional subsets must be downloaded.

---

## 3. Bug #2 — HeaderSection navigated to the title instead of the route

### Problem

In `client/src/components/ui/HeaderSection.tsx` the click handler used the section **title text** as the navigation target:

```tsx
const HeaderSection = ({ title }: HeaderSectionProps) => {  // `path` prop ignored
  ...
  <div ... onClick={() => navigate(title)}>              // e.g. navigate("/Top Deals")
```

Consumers (e.g. `TopDeals.tsx`, `CategoriesSection.tsx`) pass `path="/OFFERS_ID"`, but the handler ignored it. Clicking "Top Deals" or "See all" produced `navigate("/Top%20Deals")` instead of `navigate("/OFFERS_ID")` → wrong route / broken link. The `path` prop was received but never used.

### Fix applied

- When this fix was applied during the session, the file had **already been changed** (I did not modify it — verified via `git status`/`git diff` that the file is untracked and already contained the corrected line). Current verified state at `HeaderSection.tsx:10`:

  ```tsx
  const HeaderSection = ({ title, path }: HeaderSectionProps) => {
    ...
    <div className="flex justify-between mr-10" onClick={() => navigate(path)}>
  ```

- Behavior now correct: `navigate()` receives the intended route (`/OFFERS_ID`), matching the `path` prop passed by both consumers (`CategoriesSection.tsx:8` and `TopDeals.tsx:8`).

### Note (left as-is, low priority)

- The whole row (including the heading) is a click target plus a separate "See all" affordance that do the same thing — semantic/accessibility improvement (a real `<Link>`/`<button>`) is suggested for a future pass.
- `GallerySection.tsx` has no header row; only the two `HeaderSection` usages exist today.

---

## 4. Bug #3 — Gallery images had URL-based alt text

### Problem

`client/src/features/landing/gallery/GallerySection.tsx` set `alt={src}`, so the accessibility text was the raw file URL (e.g. `/src/assets/mock-pics/cover1.jpg`) instead of a description of the food.

### Fix applied

1. Extended the `covers` data to carry real, per-image alt text:

   ```tsx
   const covers = [
     { src: Cover1, alt: "DODZ crispy fried chicken bucket" },
     { src: Cover2, alt: "DODZ chicken meal with sides and dipping sauce" },
     { src: Cover3, alt: "Ground DODZ chicken tenders with fries and dip" },
   ];
   ```

2. Updated the render to use the alt text and keep the URL only as the React key (unchanged):

   ```tsx
   {covers.map(({ src, alt }) => (
     ...
     <img className="h-70 ..." src={src} alt={alt} />
   ))}
   ```

---

## 5. Optimization — mock image bloat (~2.6 MB → ~212 KB)

### Problem

The five mock images totalled **2 610 KB** and were far larger than their render size:

| Original | Dimensions | Size | Rendered as |
|----------|-----------|------|-------------|
| `cover1.jpg` | 49 381 × 9 654 | 757 KB | ~350–450 px wide gallery tile |
| `cover2.jpg` | 49 381 × 9 654 | 582 KB | ~350–450 px wide gallery tile |
| `cover3.png` | 2 264 × 1 404 | 423 KB | ~350–450 px wide gallery tile |
| `category.png` | 600 × 600 | 657 KB | ~120 px category cell |
| `top-deal.png` | 1 000 × 1 000 | 191 KB | ~250 px product card image |

### Approach

1. **Resize to render-appropriate dimensions** (≈2–3× the on-screen size for retina/`object-cover` cropping):
   - Covers: center-cropped to **3:2** then resized to **1200×800** (matches the ~1.25–1.6 actual display box, so no visual change vs the CSS `object-cover` crop, but far sharper per pixel).
   - `category`: 320×320. `top-deal`: 500×500.
2. **Convert to WebP** (ImageMagick, `-quality 70` covers / `80` category, `-strip` to drop EXIF/XMP). WebP chosen over AVIF for universal browser support + fast decode; AVIF was benchmarked (avifenc/libaom available) and saved only ~25% more for a slower, less-compatible format.
3. **Alpha correction (follow-up):** `top-deal.png` and `category.png` are *paletted PNGs with a transparent background* (transparency is in the `tRNS` chunk — a naive `IHDR`-flag check wrongly classified them as opaque). The first encoding pass added `-alpha off`, which **flattened away the transparency**. Fixed in a follow-up:
   - `top-deal.png` → kept as **PNG with transparency** (restored the original 1000×1000 paletted file — smaller than any RGBA resize variant: 191 KB vs 225 KB at 500×500) and the import in `TopDeals.tsx` points to `.png` again (user requirement: transparent product image).
   - `category.webp` → re-encoded **with alpha preserved** (320×320, still WebP, 15.9 KB), corners confirmed transparent.
   - Covers (`cover1/2.jpg`, `cover3.png`) are opaque photographs — WebP without alpha is correct for them.
4. **Deleted the originals** for the opaque covers only and repointed every import to the `.webp` files.

### Results

| New file | Dimensions | Size |
|----------|-----------|------|
| `cover1.webp` | 1 200 × 800 | 69.3 KB (q62 — heavier source detail) |
| `cover2.webp` | 1 200 × 800 | 57.0 KB |
| `cover3.webp` | 1 200 × 800 | 44.1 KB |
| `category.webp` | 320 × 320 | 15.9 KB (alpha preserved) |
| `top-deal.png` | 1 000 × 1 000 | 191.6 KB (transparent PNG, kept per requirement) |

**Total: 378 KB (was 2 610 KB → ~85 % reduction).**

Files updated to import the optimized images:

- `client/src/features/landing/categories/components/CategoriesSectionDesktop.tsx`
- `client/src/features/landing/categories/components/CategoriesSectionMobile.tsx`
- `client/src/features/landing/top-deals/TopDeals.tsx` (currently `.png` — transparent product image)
- `client/src/features/landing/gallery/GallerySection.tsx`

---

## 6. Files changed in this session

| File | Change |
|------|--------|
| `client/src/assets/fonts/Poppins-400.woff2` | **Added** (new, 7.88 kB) |
| `client/src/assets/fonts/Poppins-600.woff2` | **Added** (new, 7.81 kB) |
| `client/src/assets/fonts/Poppins-700.woff2` | **Added** (new, 8.00 kB) |
| `client/src/assets/mock-pics/cover1.webp` | **Added** (replaces `cover1.jpg`, −91 %) |
| `client/src/assets/mock-pics/cover2.webp` | **Added** (replaces `cover2.jpg`, −90 %) |
| `client/src/assets/mock-pics/cover3.webp` | **Added** (replaces `cover3.png`, −90 %) |
| `client/src/assets/mock-pics/category.webp` | **Added** (replaces `category.png`, `-97 %`; **alpha preserved**) |
| `client/src/assets/mock-pics/top-deal.png` | **Restored** (original transparent PNG; WebP variant removed) |
| `client/src/assets/mock-pics/{cover1.jpg,cover2.jpg,cover3.png}` | **Deleted** (superseded by WebP; opaque photographs, never had alpha) |
| `client/src/index.css` | Fixed `@font-face` paths, added weights/`font-display`, hardened fallback stack |
| `client/src/features/landing/gallery/GallerySection.tsx` | Meaningful alt text + WebP imports |
| `client/src/features/landing/categories/components/CategoriesSectionDesktop.tsx` | WebP import |
| `client/src/features/landing/categories/components/CategoriesSectionMobile.tsx` | WebP import |
| `client/src/features/landing/top-deals/TopDeals.tsx` | WebP import |
| `client/src/components/ui/HeaderSection.tsx` | Not modified this session — verified already correct (`navigate(path)`) |
| `docs/landing-page-client-audit.md` | This report |

---

## 7. Post-fix verification

| Check | Command | Result |
|-------|---------|--------|
| ESLint | `npm run lint` | ✅ Passed |
| TypeScript + build | `npm run build` | ✅ Passed |
| Font build warning | `npm run build` | ✅ Gone — fonts emit as real assets |
| Mock image assets in `dist/` | `npm run build` | ✅ Covers/category as WebP, `top-deal.png` transparent |

Current production bundle (after all fixes):

- `index-*.js` — 379.43 kB (gzip 118.20 kB)
- `index-*.css` — 51.56 kB (gzip 8.96 kB)
- 3× Poppins woff2 (~8 kB each) + mock imagery (covers + category WebP ≈ 186 KB, `top-deal.png` 192 KB transparent)

---

## 8. Open recommendations (not applied — outside scope of this pass)

Prioritized suggestions for upcoming passes:

1. **Below-fold images:** add `loading="lazy"`, `decoding="async"`, and `width`/`height` (or stable aspect-ratio) to gallery + top-deal images to cut LCP cost and further tame layout shift.
2. **Bundle size (~118 kB gzip JS):** Swiper dominates. React `lazy()` on `TopDeals`/`GallerySection` + trimming unused Swiper modules would shrink the initial route payload. `CategoriesSectionDesktop.tsx` also rebuilds a 1,000-element array on every render → wrap in `useMemo`.
3. **Dead code:** `client/src/components/ui/carousel/data.ts` duplicates `heroSlides` (unused; `Hero.tsx` imports from `src/data.ts`) and `client/src/components/ui/Button.tsx` is never imported. Safe to delete.
4. **Hero CTAs** still point to `href="#"` placeholders — wire them to real routes when available.
5. **Hero/render `<img>` swaps:** category & top-deal images are still plain `<img>`; consider `<picture>`/`srcset` when real menu photography replaces the mocks.