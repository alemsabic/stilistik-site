# Fork notes: footer

Forked from `quartz-community/footer` @ `9551f6dba23e31d75fbc43a0f78ff2c7450176a0`.

## Patch

Replaced the stock "Created with Quartz vX" line with gpunkt.org's v4 hardcoded personal links
(Alem Šabić / x.com/sarajevo), same as ale.ms's own footer fork. Dropped the `getQuartzVersion()`
helper and the `i18n` import (both only served the removed line) along with the now-unused
`src/i18n/` and `src/util/` directories.

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/components/Footer.tsx` against this file, and re-apply the
personal-links `<p>` block in place of the stock "Created with Quartz" line.
