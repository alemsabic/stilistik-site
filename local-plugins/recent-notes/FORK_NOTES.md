# Fork notes: recent-notes

Forked from `quartz-community/recent-notes` @ `2c36e87f151431b7fb05a486705adfa790126622`
(same commit ale.ms's own fork used).

## Patch

`src/components/RecentNotes.tsx`: baked in two things v4's config-driven options can't express in
v5's YAML:

1. Index-only rendering (`if (fileData.slug !== "index") return null`) — v4 only showed this on
   the index page via a `ConditionalRender` wrapper. Baked directly into the component rather than
   a `quartz.ts` `ConditionalRender` override, since `loadQuartzLayout()`'s per-pageType override
   merge is shallow (whole-array replace, not append) — fragile against future `afterBody` changes.
2. `.filter((p) => p.slug !== "index")` — v4's `filter: (f) => f.slug !== "index"` option is a JS
   callback, not expressible in YAML.
3. Removed the per-item date display entirely. **Correction, found via real-browser Phase G
   comparison against the live site**: gpunkt.org's actual v4 `RecentNotes.tsx` never rendered a
   date at all (confirmed by reading `git show v4:quartz/components/RecentNotes.tsx` — no `Date`/
   `getDate` import, no `<p class="meta">` block). This is a genuine divergence from
   `tag-page`/`folder-page`'s `PageList.tsx`, which *do* show dates on v4 — don't assume the two
   list components behave identically just because they're visually similar. The initial version
   of this fork wrongly kept a date display (copying the `PageList.tsx` pattern) and it showed up
   as a real visual diff against `https://gpunkt.org` in Phase G.

Date-sorting (`byDateAndAlphabeticalWithConfig`/`withResolvedDateType`/`getDate`) is still used
internally for list ordering — only the visible date *display* was removed, matching v4 exactly.

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/components/RecentNotes.tsx` against this file, and re-apply
the two filter/return additions above.
