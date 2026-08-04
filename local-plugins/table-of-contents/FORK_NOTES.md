# Fork notes: table-of-contents

Forked from `quartz-community/table-of-contents` @ `02c30261c64610fd0faaa3181263a91d3ff60b45`.

## Patch

Added `renderTocText()` (`src/components/TableOfContents.tsx`) — detects `[K]`/`[A]`-style badge
tokens in TOC entry text and re-renders them as `<span class="heading-badge">`, wired into both the
modern and legacy layout's `<a>` children. Same `BADGE_RE` as
`local-plugins/heading-badges/src/transformer.ts`'s AST transformer, kept as an intentional
duplicate: TOC entries (`fileData.toc[].text`) are plain text, not HTML, so the heading-level AST
transform never touches them — the badge has to be re-detected and re-rendered as JSX at TOC-render
time. See gpunkt.org's `upgrade.md` for why this stays duplicated rather than unified.

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/components/TableOfContents.tsx` against this file, and
re-apply `renderTocText()` + its two call sites.
