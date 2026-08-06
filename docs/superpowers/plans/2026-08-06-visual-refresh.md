# Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Self-host the full Geist type family (Pixel/Sans/Mono) plus JetBrains Mono, switch to a monochrome heading/title palette with a gray link accent, remove the noise texture in favor of a subtle vertical-line background, and set pure black/white theme backgrounds.

**Architecture:** Pure config + SCSS change, no new runtime code. `quartz.config.yaml` drives font family names and colors via existing CSS-variable generation (`quartz/util/theme.ts`); a new `quartz/styles/fonts.scss` partial supplies `@font-face` rules for self-hosted font files (replacing the Google Fonts CDN pipeline for this project); `quartz/styles/custom.scss` gets targeted edits to wire the new `--titleFont`/`--headerFont` split, drop now-dead `font-weight` rules on Geist Pixel elements, apply the font's `ELSH` variation axis, recolor headings, and swap noise for the line pattern.

**Tech Stack:** Quartz v5 (vendored, not an npm dependency), Sass/SCSS, YAML config. Font conversion via the `ttf2woff2` npm package (no Python/fonttools needed).

## Global Constraints

- Self-host all four typefaces (no Google Fonts CDN requests at runtime) — GDPR motivation, see spec §1.
- `Geist Pixel` is used **only** for `--titleFont` elements (H1, `.page-title a`, `.tagline`, the drop-cap) — never for H2–H6.
- Pixel-shape axis value is a single SCSS variable (`$geist-pixel-shape`, value `80` = "Line") — every Geist Pixel element must reference it, none may hardcode a literal `ELSH` value.
- Background: `#ffffff` (light) / `#000000` (dark) — pure, not off-white/off-black.
- Headings + title: `#000000` (light) / `#ffffff` (dark) — replaces the current blue/orange accent.
- Links/tags/active-nav (`secondary`/`tertiary` config colors): `#444444`/`#222222` (light base/hover), `#cccccc`/`#eeeeee` (dark base/hover).
- Vertical line background: `repeating-linear-gradient(90deg, <color> 0 1px, transparent 1px 80px)`, `rgba(0,0,0,0.08)` light / `rgba(255,255,255,0.08)` dark, applied directly on `body`.
- Every task must end with `npx quartz build` succeeding with no errors before moving to the next task.
- Reference spec: `docs/superpowers/specs/2026-08-06-visual-refresh-design.md`.

---

### Task 1: Self-hosted font asset pipeline

**Files:**
- Create: `quartz/static/fonts/GeistPixel-ELSH.woff2`
- Create: `quartz/static/fonts/Geist-wght.woff2`
- Create: `quartz/static/fonts/Geist-Italic-wght.woff2`
- Create: `quartz/static/fonts/GeistMono-wght.woff2`
- Create: `quartz/static/fonts/GeistMono-Italic-wght.woff2`
- Create: `quartz/static/fonts/JetBrainsMono-wght.woff2`
- Create: `quartz/static/fonts/JetBrainsMono-Italic-wght.woff2`
- Create: `quartz/static/fonts/LICENSE-GeistPixel.txt`
- Create: `quartz/static/fonts/LICENSE-Geist.txt`
- Create: `quartz/static/fonts/LICENSE-GeistMono.txt`
- Create: `quartz/static/fonts/LICENSE-JetBrainsMono.txt`

**Interfaces:**
- Produces: seven `.woff2` files at the paths above, referenced by `url("/static/fonts/<name>.woff2")` in Task 2's `fonts.scss`. Filenames are exact — Task 2 depends on them matching precisely.

- [ ] **Step 1: Create the fonts directory and a scratch dir for the source TTFs**

```bash
mkdir -p quartz/static/fonts
mkdir -p /tmp/stilistik-font-src
```

- [ ] **Step 2: Download the seven source TTFs (verified URLs, pinned where the upstream repo has commit history)**

```bash
curl -sL -o /tmp/stilistik-font-src/GeistPixel-ELSH.ttf \
  "https://raw.githubusercontent.com/vercel/geist-font/10dc7658f13c38a474cde201bb09a4617267545b/fonts/GeistPixel/variable/GeistPixel%5BELSH%5D.ttf"
curl -sL -o /tmp/stilistik-font-src/Geist-wght.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/geist/Geist%5Bwght%5D.ttf"
curl -sL -o /tmp/stilistik-font-src/Geist-Italic-wght.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/geist/Geist-Italic%5Bwght%5D.ttf"
curl -sL -o /tmp/stilistik-font-src/GeistMono-wght.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/geistmono/GeistMono%5Bwght%5D.ttf"
curl -sL -o /tmp/stilistik-font-src/GeistMono-Italic-wght.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/geistmono/GeistMono-Italic%5Bwght%5D.ttf"
curl -sL -o /tmp/stilistik-font-src/JetBrainsMono-wght.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
curl -sL -o /tmp/stilistik-font-src/JetBrainsMono-Italic-wght.ttf \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono-Italic%5Bwght%5D.ttf"
```

- [ ] **Step 3: Verify all seven downloads succeeded (each file must be a real TTF, not an HTML error page)**

```bash
file /tmp/stilistik-font-src/*.ttf
```

Expected: seven lines, each ending in `TrueType Font data` (or `data` — some `file` versions report variable TTFs generically; the deciding check is size, see below). Reject anything reported as `HTML document` or `ASCII text` — that means the URL returned a GitHub error page, not font data.

```bash
ls -la /tmp/stilistik-font-src/*.ttf
```

Expected sizes (bytes, approximate — GitHub raw content is stable but not byte-frozen at the source revision for the `main`-branch files, only the pinned `geist-font` commit is exact): `GeistPixel-ELSH.ttf` **exactly** 3657104 (pinned commit), the other six each in the 160,000–195,000 range. Any file under 10,000 bytes is almost certainly an error page — stop and investigate before continuing.

- [ ] **Step 4: Convert each TTF to woff2 directly into `quartz/static/fonts/`**

```bash
npx --yes ttf2woff2 < /tmp/stilistik-font-src/GeistPixel-ELSH.ttf > quartz/static/fonts/GeistPixel-ELSH.woff2
npx --yes ttf2woff2 < /tmp/stilistik-font-src/Geist-wght.ttf > quartz/static/fonts/Geist-wght.woff2
npx --yes ttf2woff2 < /tmp/stilistik-font-src/Geist-Italic-wght.ttf > quartz/static/fonts/Geist-Italic-wght.woff2
npx --yes ttf2woff2 < /tmp/stilistik-font-src/GeistMono-wght.ttf > quartz/static/fonts/GeistMono-wght.woff2
npx --yes ttf2woff2 < /tmp/stilistik-font-src/GeistMono-Italic-wght.ttf > quartz/static/fonts/GeistMono-Italic-wght.woff2
npx --yes ttf2woff2 < /tmp/stilistik-font-src/JetBrainsMono-wght.ttf > quartz/static/fonts/JetBrainsMono-wght.woff2
npx --yes ttf2woff2 < /tmp/stilistik-font-src/JetBrainsMono-Italic-wght.ttf > quartz/static/fonts/JetBrainsMono-Italic-wght.woff2
```

- [ ] **Step 5: Verify the woff2 outputs are valid and much smaller than the source TTFs**

```bash
file quartz/static/fonts/*.woff2
```

Expected: all seven report `Web Open Font Format 2.0` (or similar — exact wording depends on the local `file`/`libmagic` version, but each line must mention `Web Open Font Format`, not `data` alone).

```bash
ls -la quartz/static/fonts/*.woff2
```

Expected: `GeistPixel-ELSH.woff2` around 41 KB (verified during design: 3,657,104 → 41,332 bytes). The other six should each be well under 100 KB — variable woff2 compression on ~170–195 KB TTF sources typically lands in the 50–100 KB range. If any file is 0 bytes or close to the TTF's original size, the conversion silently failed — re-run that one conversion.

- [ ] **Step 6: Download the four OFL/license files (required for redistribution — all four families are OFL-licensed)**

```bash
curl -sL -o quartz/static/fonts/LICENSE-GeistPixel.txt \
  "https://raw.githubusercontent.com/vercel/geist-font/10dc7658f13c38a474cde201bb09a4617267545b/LICENSE.txt"
curl -sL -o quartz/static/fonts/LICENSE-Geist.txt \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/geist/OFL.txt"
curl -sL -o quartz/static/fonts/LICENSE-GeistMono.txt \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/geistmono/OFL.txt"
curl -sL -o quartz/static/fonts/LICENSE-JetBrainsMono.txt \
  "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/OFL.txt"
```

Verify: `grep -l "SIL OPEN FONT LICENSE" quartz/static/fonts/LICENSE-*.txt` should list all four files.

- [ ] **Step 7: Clean up the scratch TTF directory (not needed after conversion, and TTFs must not be committed — only the woff2 outputs)**

```bash
rm -rf /tmp/stilistik-font-src
```

- [ ] **Step 8: Commit**

```bash
git add quartz/static/fonts/
git commit -m "feat: self-host Geist Pixel, Geist, Geist Mono, JetBrains Mono as woff2"
```

---

### Task 2: `fonts.scss` partial with `@font-face` rules, wired into `custom.scss`

**Files:**
- Create: `quartz/styles/fonts.scss`
- Modify: `quartz/styles/custom.scss:1`

**Interfaces:**
- Consumes: the seven `.woff2` files from Task 1, at the exact paths `quartz/static/fonts/<name>.woff2` (served at runtime as `/static/fonts/<name>.woff2`, since `quartz/static/` is copied 1:1 to `public/static/`).
- Produces: `$geist-pixel-shape` (SCSS variable, value `80`) — Task 4 references this by name. `@font-face` declarations for `font-family: "Geist Pixel"`, `"Geist"`, `"Geist Mono"`, `"JetBrains Mono"` — Task 3's `quartz.config.yaml` typography names must match these exactly (case-sensitive) or the `--titleFont`/`--headerFont`/`--bodyFont`/`--codeFont` CSS variables generated by `theme.ts:191-194` won't resolve to these faces.

- [ ] **Step 1: Write `quartz/styles/fonts.scss`**

```scss
// Self-hosted fonts (theme.fontOrigin: local in quartz.config.yaml — CDN
// requests to Google Fonts would leak visitor IPs without consent, see
// docs/superpowers/specs/2026-08-06-visual-refresh-design.md §1).
// Source TTFs converted to woff2 via `npx ttf2woff2` (see Task 1 of the
// implementation plan for exact download commands and provenance).

// Element Shape value for Geist Pixel's ELSH axis (0-100, five named styles:
// Square=1, Circle=20, Grid=40, Triangle=60, Line=80 — see spec §1 for the
// full table and why ELSH is a style-selector, not an intensity axis).
// Change this single value to switch styles everywhere Geist Pixel is used.
$geist-pixel-shape: 80;

@font-face {
  font-family: "Geist Pixel";
  src: url("/static/fonts/GeistPixel-ELSH.woff2") format("woff2-variations");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Geist";
  src: url("/static/fonts/Geist-wght.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Geist";
  src: url("/static/fonts/Geist-Italic-wght.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: "Geist Mono";
  src: url("/static/fonts/GeistMono-wght.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Geist Mono";
  src: url("/static/fonts/GeistMono-Italic-wght.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: "JetBrains Mono";
  src: url("/static/fonts/JetBrainsMono-wght.woff2") format("woff2-variations");
  font-weight: 100 800;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "JetBrains Mono";
  src: url("/static/fonts/JetBrainsMono-Italic-wght.woff2") format("woff2-variations");
  font-weight: 100 800;
  font-style: italic;
  font-display: swap;
}
```

- [ ] **Step 2: Wire the partial into `custom.scss`**

`quartz/styles/custom.scss` currently opens with:

```scss
@use "./variables.scss" as *;
```

Change to:

```scss
@use "./variables.scss" as *;
@use "./fonts.scss" as *;
```

(`as *` — no namespace prefix — matches the existing `variables.scss` import style and makes `$geist-pixel-shape` directly usable in Task 4 without a module prefix. Sass `@use` includes a used module's own top-level CSS rules in the compiled output once, same mechanism `base.scss` already relies on for `variables.scss`/`syntax.scss`/`callouts.scss`.)

- [ ] **Step 3: Build and verify no Sass errors**

```bash
npx quartz build
```

Expected: build completes with no errors. If Sass reports a duplicate `@font-face` or syntax error, check for stray characters in the `fonts.scss` edit.

- [ ] **Step 4: Verify all four font families landed in the compiled CSS**

The build pipeline minifies through `lightningcss` (see `componentResources.ts:22`), which may normalize `"` to `'` and strip whitespace — match loosely on quote style rather than assuming exact formatting:

```bash
grep -oE "font-family:['\"]Geist Pixel['\"]" public/index.css | wc -l
grep -oE "font-family:['\"]Geist Mono['\"]" public/index.css | wc -l
grep -oE "font-family:['\"]JetBrains Mono['\"]" public/index.css | wc -l
grep -oE "font-family:['\"]Geist['\"]" public/index.css | wc -l
```

Expected: `1` for Geist Pixel (single face), `2` each for Geist Mono/JetBrains Mono/Geist (normal + italic faces). The last command's exact-match pattern (`'Geist'` with a closing quote right after, not `'Geist Pixel'` or `'Geist Mono'`) avoids false positives from the other two families.

```bash
grep -c '/static/fonts/' public/index.css
```

Expected: `7` (one `url()` reference per woff2 file).

- [ ] **Step 5: Commit**

```bash
git add quartz/styles/fonts.scss quartz/styles/custom.scss
git commit -m "feat: add self-hosted font-face rules, wire into custom.scss"
```

---

### Task 3: `quartz.config.yaml` — font origin, typography roles, colors, tagline

**Files:**
- Modify: `quartz.config.yaml:15-42`

**Interfaces:**
- Consumes: `$geist-pixel-shape` and the four `@font-face` blocks from Task 2 (font family name strings must match exactly).
- Produces: `--titleFont`, `--headerFont`, `--bodyFont`, `--codeFont`, `--light`, `--secondary`, `--tertiary` CSS custom properties (auto-generated by `theme.ts:191-194` and `theme.ts:181-204`) that Tasks 4–6 rely on by name.

- [ ] **Step 1: Edit the `theme` block**

Current (`quartz.config.yaml:15-42`):

```yaml
  theme:
    fontOrigin: googleFonts
    cdnCaching: true
    typography:
      header: Geist Pixel
      body: Geist Mono
      code: JetBrains Mono
    colors:
      lightMode:
        light: "#d4d4d4"
        lightgray: rgba(0, 0, 0, 0.07)
        gray: "#666666"
        darkgray: "#111111"
        dark: "#222222"
        secondary: "#3347cb"
        tertiary: "#5468e0"
        highlight: rgba(0, 0, 0, 0.08)
        textHighlight: "#00000014"
      darkMode:
        light: "#0a1967"
        lightgray: rgba(255, 255, 255, 0.1)
        gray: "#888888"
        darkgray: "#eeeeee"
        dark: "#dddddd"
        secondary: "#ee683d"
        tertiary: "#f58a68"
        highlight: rgba(255, 255, 255, 0.1)
        textHighlight: "#ffffff14"
```

New:

```yaml
  theme:
    fontOrigin: local
    cdnCaching: false
    typography:
      title: Geist Pixel
      header: Geist
      body: Geist Mono
      code: JetBrains Mono
    colors:
      lightMode:
        light: "#ffffff"
        lightgray: rgba(0, 0, 0, 0.07)
        gray: "#666666"
        darkgray: "#111111"
        dark: "#222222"
        secondary: "#444444"
        tertiary: "#222222"
        highlight: rgba(0, 0, 0, 0.08)
        textHighlight: "#00000014"
      darkMode:
        light: "#000000"
        lightgray: rgba(255, 255, 255, 0.1)
        gray: "#888888"
        darkgray: "#eeeeee"
        dark: "#dddddd"
        secondary: "#cccccc"
        tertiary: "#eeeeee"
        highlight: rgba(255, 255, 255, 0.1)
        textHighlight: "#ffffff14"
```

(`cdnCaching: false` — inert once `fontOrigin` is `local`, since both `Head.tsx:51` and `componentResources.ts:285` gate their Google Fonts branches on `fontOrigin === "googleFonts"`; set to `false` for a future reader's clarity rather than leaving a stale `true`.)

- [ ] **Step 2: Update the tagline**

Current (`quartz.config.yaml:4`):

```yaml
  pageTitleSuffix: "Die moderne Stilistik für professionelles Deutsch."
```

New:

```yaml
  pageTitleSuffix: "Die moderne Stilistik — für professionelles Deutsch, lesbar von Mensch und Maschine."
```

- [ ] **Step 3: Build and verify no Google Fonts requests remain**

```bash
npx quartz build
grep -c "fonts.googleapis.com" public/index.html
```

Expected: `0` (no `<link>` to Google Fonts in the built HTML — confirms the `Head.tsx:51` branch is correctly skipped now that `fontOrigin` is `local`).

- [ ] **Step 4: Verify the new colors and tagline landed**

`lightningcss` may minify `#ffffff` to `#fff` and `#444444` to `#444` (both are minifiable repeating-pair hex codes) — match either form:

```bash
grep -cE -- "--light:\s*#(ffffff|fff)\b" public/index.css
grep -cE -- "--secondary:\s*#(444444|444)\b" public/index.css
grep "Die moderne Stilistik" public/index.html
```

Expected: both grep-count commands return `1`; the tagline grep returns at least one matching line containing the new full sentence.

- [ ] **Step 5: Commit**

```bash
git add quartz.config.yaml
git commit -m "feat: local font origin, Geist typography roles, monochrome accent colors, updated tagline"
```

---

### Task 4: Title/header font-family split + ELSH styling in `custom.scss`

**Files:**
- Modify: `quartz/styles/custom.scss:114-117` (`.page-title`)
- Modify: `quartz/styles/custom.scss:162-165` (`h1`)
- Modify: `quartz/styles/custom.scss:189-192` (`.page-title a`)
- Modify: `quartz/styles/custom.scss:194-201` (`article h2`)
- Modify: `quartz/styles/custom.scss:219-225` (`article h4`)
- Modify: `quartz/styles/custom.scss:390-396` (`.tagline`)
- Modify: `quartz/styles/custom.scss:1015-1023` (drop-cap `::first-letter`)

**Interfaces:**
- Consumes: `$geist-pixel-shape` (Task 2), `--titleFont`/`--headerFont` CSS variables (Task 3 — resolve to Geist Pixel / Geist respectively once that task lands).

- [ ] **Step 1: `.page-title` — switch from `--headerFont` to `--titleFont`**

Current (`custom.scss:114-117`):

```scss
// Page title font size - responsive
.page-title {
  font-size: 1.95rem !important; // Mobile
  font-family: var(--headerFont) !important;
}
```

New:

```scss
// Page title font size - responsive
.page-title {
  font-size: 1.95rem !important; // Mobile
  font-family: var(--titleFont) !important;
}
```

- [ ] **Step 2: `h1` — drop the dead `font-weight`, pull onto `--titleFont`, apply the pixel shape**

Current (`custom.scss:162-165`):

```scss
// H1 font-weight
h1 {
  font-weight: 900 !important;
}
```

New:

```scss
// H1 uses the title font (Geist Pixel) — H2-H6 stay on the header font (Geist)
// via base.scss's shared h1-h6 rule, this pulls H1 out of that group.
h1 {
  font-family: var(--titleFont) !important;
  font-variation-settings: "ELSH" #{$geist-pixel-shape};
}
```

- [ ] **Step 3: `.page-title a` — drop the dead `font-weight`, apply the pixel shape**

Current (`custom.scss:189-192`):

```scss
// Page title link font weight to match headings
.page-title a {
  font-weight: 900 !important;
}
```

New:

```scss
// Page title link matches the title font's pixel shape
.page-title a {
  font-variation-settings: "ELSH" #{$geist-pixel-shape};
}
```

- [ ] **Step 4: `article h2` — drop the dead `font-weight` line (Geist has a real `wght` axis, but no explicit weight was ever intentional here beyond the browser default — removing the dead override, not replacing it, matches how `article h4` below is handled)**

Current (`custom.scss:194-201`):

```scss
article h2 {
  margin-top: 3.9rem !important;
  font-weight: 500;
  font-size: 1.8rem;
  border-bottom: 2px solid;
  padding-bottom: 0.25rem;
}
```

New:

```scss
article h2 {
  margin-top: 3.9rem !important;
  font-size: 1.8rem;
  border-bottom: 2px solid;
  padding-bottom: 0.25rem;
}
```

- [ ] **Step 5: `article h4` — drop the dead `font-weight` line**

Current (`custom.scss:219-225`):

```scss
article h4 {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  margin-top: 2rem;
  margin-bottom: 2rem;
}
```

New:

```scss
article h4 {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}
```

- [ ] **Step 6: `.tagline` — apply the pixel shape (it already uses `--titleFont`, but never had an explicit `ELSH` value, so it was rendering at the axis default `0` instead of the chosen style)**

Current (`custom.scss:390-396`):

```scss
.tagline {
  font-size: 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 2.5rem;
  line-height: 1.1rem;
  font-family: var(--titleFont);
}
```

New:

```scss
.tagline {
  font-size: 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 2.5rem;
  line-height: 1.1rem;
  font-family: var(--titleFont);
  font-variation-settings: "ELSH" #{$geist-pixel-shape};
}
```

- [ ] **Step 7: Drop-cap `::first-letter` — switch from `--headerFont` to `--titleFont`, drop the dead `font-weight`, apply the pixel shape**

This element is large (3.4em) and decorative, matching how Geist Pixel is used everywhere else in this plan — H1-adjacent display treatment, not a body-adjacent heading.

Current (`custom.scss:1015-1023`):

```scss
h2:has(.heading-badge) + p::first-letter {
  float: left;
  font-size: 3.4em;
  line-height: 0.82;
  margin-right: 0.07em;
  margin-bottom: -0.05em;
  font-family: var(--headerFont);
  font-weight: 900;
}
```

New:

```scss
h2:has(.heading-badge) + p::first-letter {
  float: left;
  font-size: 3.4em;
  line-height: 0.82;
  margin-right: 0.07em;
  margin-bottom: -0.05em;
  font-family: var(--titleFont);
  font-variation-settings: "ELSH" #{$geist-pixel-shape};
}
```

- [ ] **Step 8: Build and verify**

```bash
npx quartz build
grep -o "ELSH" public/index.css | wc -l
```

Expected: build succeeds with no errors; the count is `4` (h1, `.page-title a`, `.tagline`, drop-cap — this axis tag string doesn't appear anywhere else in the codebase, so a plain substring count is safe even through minification's quote/whitespace normalization).

- [ ] **Step 9: Manual visual check**

```bash
npx quartz build --serve
```

Open the served URL, check any content page: H1 and the site title in the sidebar should render in the blocky "Line" pixel style; H2/H3 should render in the normal Geist sans (no pixel artifacts); body text stays on Geist Mono. Stop the server (`Ctrl-C`) when done.

- [ ] **Step 10: Commit**

```bash
git add quartz/styles/custom.scss
git commit -m "feat: split title/header fonts, apply Geist Pixel ELSH shape to title elements only"
```

---

### Task 5: Monochrome heading/title color

**Files:**
- Modify: `quartz/styles/custom.scss:166-187`

**Interfaces:**
- Consumes: none beyond plain hex values — this task is independent of Tasks 1–4 and could be done in isolation, but is sequenced after them to keep all `custom.scss` heading-related edits together for review.

- [ ] **Step 1: Replace the blue/orange heading color rules**

Current (`custom.scss:166-187`):

```scss
// Light theme: alle Überschriften + Page-Title in Blau
[saved-theme="light"] h1,
[saved-theme="light"] h2,
[saved-theme="light"] h3,
[saved-theme="light"] h4,
[saved-theme="light"] h5,
[saved-theme="light"] h6,
[saved-theme="light"] .page-title a {
  color: #3347cb !important;
}

// Dark theme: alle Überschriften + Page-Title in Orange
[saved-theme="dark"] h1,
[saved-theme="dark"] h2,
[saved-theme="dark"] h3,
[saved-theme="dark"] h4,
[saved-theme="dark"] h5,
[saved-theme="dark"] h6,
[saved-theme="dark"] .page-title a {
  color: #ee683d !important;
}
```

New:

```scss
// Light theme: alle Überschriften + Page-Title in Fast-Schwarz (monochrom,
// kein Farbakzent mehr — der Akzent lebt jetzt nur noch bei Links, siehe
// theme.colors.secondary/tertiary in quartz.config.yaml)
[saved-theme="light"] h1,
[saved-theme="light"] h2,
[saved-theme="light"] h3,
[saved-theme="light"] h4,
[saved-theme="light"] h5,
[saved-theme="light"] h6,
[saved-theme="light"] .page-title a {
  color: #000000 !important;
}

// Dark theme: alle Überschriften + Page-Title in Fast-Weiß
[saved-theme="dark"] h1,
[saved-theme="dark"] h2,
[saved-theme="dark"] h3,
[saved-theme="dark"] h4,
[saved-theme="dark"] h5,
[saved-theme="dark"] h6,
[saved-theme="dark"] .page-title a {
  color: #ffffff !important;
}
```

- [ ] **Step 2: Build and verify**

```bash
npx quartz build
grep -c "#3347cb\|#ee683d" quartz/styles/custom.scss
```

Expected: build succeeds; grep count is `0` (old colors fully removed from this file — `quartz.config.yaml` already had its own independent occurrences replaced in Task 3).

- [ ] **Step 3: Commit**

```bash
git add quartz/styles/custom.scss
git commit -m "style: monochrome heading/title color, accent moves to links only"
```

---

### Task 6: Remove noise texture, add vertical-line background

**Files:**
- Modify: `quartz/styles/custom.scss:249-266`

**Interfaces:** none — self-contained visual change.

- [ ] **Step 1: Replace the noise `::before` block with a direct `body` background**

Current (`custom.scss:249-266`):

```scss
// Noise texture overlay - light theme
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url("/static/noise.png");
  background-repeat: repeat;
  pointer-events: none;
  z-index: 9999;
}

// Noise texture overlay - dark theme
[saved-theme="dark"] body::before {
  opacity: 0.5;
}
```

New:

```scss
// Vertical line background — subtle, DNB-Buchumschlag-inspired accent that
// replaces the old noise texture (removed for a cleaner look). No pseudo-
// element needed here (unlike the old noise overlay) since this doesn't use
// a blend mode.
body {
  background-image: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.08) 0 1px,
    transparent 1px 80px
  );
}

[saved-theme="dark"] body {
  background-image: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0 1px,
    transparent 1px 80px
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
npx quartz build
grep -c "noise.png" quartz/styles/custom.scss
grep -c "repeating-linear-gradient" public/index.css
```

Expected: build succeeds; first grep is `0` (no more noise reference in custom.scss — `quartz/static/noise.png` itself is left in place per spec, unreferenced is fine); second grep is `2` (light + dark line-pattern rules).

- [ ] **Step 3: Manual visual check**

```bash
npx quartz build --serve
```

Open the served URL in both light and dark theme (toggle via the site's dark-mode button). Confirm: no visible grain/noise texture; faint vertical lines visible on close inspection, ~80px apart, barely there at a normal viewing distance. Stop the server when done.

- [ ] **Step 4: Commit**

```bash
git add quartz/styles/custom.scss
git commit -m "style: replace noise texture with subtle vertical-line background"
```

---

### Task 7: Full production build verification

**Files:** none modified — verification only.

**Interfaces:** none.

- [ ] **Step 1: Run the exact documented Cloudflare Pages build command**

```bash
npx quartz plugin install --from-config && npx quartz build
```

Expected: completes with no errors or warnings about missing fonts/plugins.

- [ ] **Step 2: Confirm no stray Google Fonts references anywhere in the build output**

```bash
grep -rl "fonts.googleapis.com\|fonts.gstatic.com" public/ || echo "clean"
```

Expected: `clean` (no matches — grep exits non-zero on no match, the `||` prints the confirmation).

- [ ] **Step 3: Confirm every referenced static font file was actually emitted**

```bash
for f in GeistPixel-ELSH Geist-wght Geist-Italic-wght GeistMono-wght GeistMono-Italic-wght JetBrainsMono-wght JetBrainsMono-Italic-wght; do
  test -f "public/static/fonts/${f}.woff2" && echo "OK: ${f}.woff2" || echo "MISSING: ${f}.woff2"
done
```

Expected: seven `OK:` lines, zero `MISSING:` lines.

- [ ] **Step 4: Full manual visual pass in the browser**

```bash
npx quartz build --serve
```

Open the served URL and check, in both light and dark theme, at both desktop and mobile widths (resize the browser or use devtools device emulation):
- Site title / H1 render in the Geist Pixel "Line" style, legible.
- H2/H3 render in plain Geist sans, no pixel artifacts.
- Body text renders in Geist Mono.
- Background is pure white (light) / pure black (dark), no gray/navy tint.
- Faint vertical lines visible in the background on close inspection, in both themes.
- No noise/grain texture anywhere.
- Headings and the site title render near-black (light) / near-white (dark) — no blue or orange.
- Links (in article body text) render in the gray accent (`#444444` light / `#cccccc` dark), visibly a link but not loud; hovering shifts them darker (light) / lighter (dark).

Stop the server when done. This step has no automated pass/fail — note any visual issue found and fix it in the relevant task's file before considering the plan complete.

- [ ] **Step 5: `tsc`/prettier sanity check (repo-wide, catches any accidental syntax issue introduced across the edited files)**

```bash
npm run check
```

Expected: no TypeScript errors, no Prettier formatting violations. If Prettier flags the edited `.scss`/`.yaml` files, run `npm run format` and re-verify the build (Step 1) still succeeds, then amend the affected task's commit — do not create a separate "fix formatting" commit for changes that belong to an already-committed task.

No commit for this task — it's verification-only. If Step 4 or Step 5 surfaces an issue, fix it within the task that owns the affected file and amend that task's commit, don't create a new task for it.
