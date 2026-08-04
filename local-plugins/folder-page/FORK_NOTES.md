# Fork notes: folder-page

Forked from `quartz-community/folder-page` @ `213a8e98c4347aca9013c0dd5a15bc80a1dca604`
(same commit ale.ms's own fork used).

## Patch

`src/components/PageList.tsx`'s `DateDisplay` changed from stock `toLocaleDateString(locale, {...})`
to gpunkt.org's DD.MM.YYYY format (same patch as core `Date.tsx`, `local-plugins/tag-page`, and
`local-plugins/recent-notes`).

Unlike ale.ms's own fork of this same plugin, the date column itself is **kept** — gpunkt.org's v4
never removed dates from tag/folder list pages, so only the format needed changing, not the
date's presence. Don't apply ale.ms's `grid-template-columns` CSS fix for this reason: the stock
3-column `listPage.scss` grid (date + desc + tags) is already correct for gpunkt.org's 3-item
layout.

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/components/PageList.tsx` against this file, and re-apply the
`DateDisplay` format change.
