# Fork notes: github-flavored-markdown

Forked from `quartz-community/github-flavored-markdown` @
`287c709c12806dca76882ab8ab79567d57ede5b4` (same commit ale.ms's own fork used).

## Patch

Added a `rehypeFootnoteRefNoPopover` hast-visitor (`src/transformer.ts`) that sets
`data-no-popover: true` on any `<a>` whose parent is a `<sup>` — i.e. footnote-reference markers.
Wired into both `htmlPlugins()` return paths (`linkHeadings` true and false), so it always runs
regardless of that option. Added `unist-util-visit` to `devDependencies` (tsup bundles it via
`noExternal: [/.*/]`, same pattern the plugin's other markdown deps use).

Suppresses the citation-tooltip popover on footnote refs — they aren't real internal links, so the
popover-preview hover behavior shouldn't apply to them. Bibliography-backlink popover suppression is
a separate, already-upstream concern (handled by `@quartz-community/citations`, not this plugin).

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/transformer.ts` against this file, and re-apply the
`rehypeFootnoteRefNoPopover` function + its two call sites.
