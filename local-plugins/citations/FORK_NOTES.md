# Fork notes: citations

Forked from `quartz-community/citations` @ `5db598448105ee791665ff3b5e4c35b285a85296`.

## Patch

`src/transformer.ts`: added `showTooltips`/`tooltipAttribute` to `CitationsOptions` and threaded
them through to the `rehypeCitation` call. The real `rehype-citation` npm package genuinely
supports these (verified by reading its bundled source — it generates a `data-tooltip`-style
attribute with the rendered bibliography-entry text when `showTooltips` is set), but
`@quartz-community/citations`'s wrapper hand-picks a fixed set of fields to pass through rather
than spreading user options, silently dropping these two. Without this fork, hover tooltips on
citations never render — found via a real bug report ("tooltip on hover doesn't show sources")
after the v4→v5 cutover, root-caused by comparing directly against ale.ms's own
`local-plugins/citations` fork, which already carries the identical patch (with a comment
anticipating gpunkt.org would need the same fix).

## Re-syncing with upstream

Re-clone at a newer commit, diff `src/transformer.ts` against this file, and re-apply the two
interface fields + the two `rehypeCitation` call-site additions.
