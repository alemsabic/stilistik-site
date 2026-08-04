# Fork notes: tag-page

Forked from `quartz-community/tag-page` @ `a651839686ed2bd7e58beb01709b9a682dc9add8`
(same commit ale.ms's own fork used).

## Patch

`src/components/PageList.tsx`'s `DateDisplay` changed from stock `toLocaleDateString(locale, {...})`
to gpunkt.org's DD.MM.YYYY format (same patch as core `Date.tsx` and `local-plugins/recent-notes`).

Unlike ale.ms's own fork of this same plugin, the date column itself is **kept** — gpunkt.org's v4
never removed dates from tag/folder list pages, so only the format needed changing, not the
date's presence. Don't apply ale.ms's `grid-template-columns` CSS fix for this reason: the stock
3-column `listPage.scss` grid (date + desc + tags) is already correct for gpunkt.org's 3-item
layout.

`src/i18n/locales/de-DE.ts` also patched: `tag`/`tagIndex`/`itemsUnderTag`/`showingFirst`/
`totalTags` strings changed from stock "Tag" wording to gpunkt.org's v4 "Schlagwort" terminology.

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/components/PageList.tsx` and `src/i18n/locales/de-DE.ts`
against these files, and re-apply the `DateDisplay` format change + the five Schlagwort strings.
