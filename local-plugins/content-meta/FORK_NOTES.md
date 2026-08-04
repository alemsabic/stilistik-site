# Fork notes: content-meta

Forked from `quartz-community/content-meta` @ `3066ef3eaf88c08c7e123d07cc3be8e07b2f4e10`
(same commit ale.ms's own fork used).

## Patch

`src/i18n/locales/de-DE.ts`: readingTime phrasing changed from stock `"X Min. Lesezeit"` to
gpunkt.org's v4 wording, `"X Minuten Lesezeit."` with singular handling (`"1 Minute Lesezeit."`).

Note: `content-meta` is excluded on gpunkt.org's `content` page type (its date+tags job is covered
by `local-plugins/content-header` there) and doesn't currently render visible readingTime output on
any other page type either (folder/tag list pages have no single body of their own) — this fork
exists for completeness/future-proofing, not because it's currently visible anywhere.

## Re-syncing with upstream

Re-clone at a newer commit and re-apply the `readingTime` string in `src/i18n/locales/de-DE.ts`.
