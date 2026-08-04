# Fork notes: content-index

Forked from `quartz-community/content-index` @ `1342d1eacfdabbcefa2c6a26f8346945a9d9860f`
(same commit ale.ms's own fork used, confirmed independently via `git log -1`).

## Patch

Added `shortTitle?: string` to `ContentDetails` (`src/emitter.ts`), extracted from
`frontmatter.shortTitle` in the `emitAll()` loop — powers gpunkt.org's v4 behavior of showing a
short label (e.g. `Ahrens (2017)`) in the Explorer/breadcrumbs for Zotero literature-note sources,
falling back to the full title otherwise. See `quartz/util/fileTrie.ts`'s `displayName` getter and
`quartz/util/ctx.ts`'s `trieFromAllFiles()`, which read this same field.

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/emitter.ts` against this file, and re-apply the two edits above
(the `shortTitle` field + the one extraction line) — the patch is small and self-contained.
