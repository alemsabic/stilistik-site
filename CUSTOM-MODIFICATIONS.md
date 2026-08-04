# Custom Modifications (gpunkt.org)

Every behavior in this repo that deviates from stock Quartz v5. Read this before editing any of the
files listed below.

**Sister project**: [[ale.ms|/Users/alemsabic/Desktop/ale.ms]] documents the same categories of
custom behavior in its own `CUSTOM-MODIFICATIONS.md`, generally with more surface area (see
"Diverges from ale.ms" notes below). Check there before assuming gpunkt.org's version is the
complete picture of what's possible.

## Footnote Highlighting

**Files**: `local-plugins/site-scripts/src/components/scripts/footnotes.inline.ts` (whole file, 66
lines), `local-plugins/site-scripts/src/components/SiteScripts.tsx` (wires the script into
`afterDOMLoaded`).

On every SPA `nav` event, `highlightFootnote()` reads `window.location.hash`. If it starts with
`#user-content-fn-`, it adds a `.footnote-highlighted` class to the matching `<li>` (clearing any
previous highlight first) — a manual re-implementation of CSS `:target` styling, needed because
`:target` doesn't reliably re-fire across Quartz's client-side navigation. It also listens for
`hashchange` and for clicks on `a[href^="#user-content-fn-"]` (10ms `setTimeout` to let the browser
scroll first), registered via `window.addCleanup` for correct SPA teardown. The same handler also
renames the "Footnotes" `<h2>` to German "Fußnoten", and injects a "Quellen" `<h2>` into the
`#refs.references.csl-bib-body` bibliography block if one isn't already present. Styling for
`.footnote-highlighted` lives in `quartz/styles/custom.scss` (paired 1:1 with the `:target`
selector, ~line 586 and the `[data-tooltip]` block ~line 753).

**Why**: book-style highlight-on-click footnote UX, plus German section headings for a
German-language dictionary site.

## Popover Behavior (Citations plugin fork)

**File**: `local-plugins/citations/src/transformer.ts`.

A full local fork of the `Citations` transformer plugin (wraps `rehype-citation`). After running
`rehypeCitation`, a second `unist-util-visit` pass walks the HTML AST and sets
`data-no-popover: true` on (a) any `<a href="#bib...">` (bibliography backlinks) and (b) any `<a>`
whose parent is a `<sup>` (footnote reference markers) — suppressing Quartz's default hover-preview
popover on same-page anchors, since previewing "the bottom of the current page" is meaningless. The
same pass also HTML-entity-decodes the `data-tooltip` attribute (`&amp;`, `&quot;`, etc. → literal
characters) so citation tooltip text renders correctly. The plugin's `Options` interface adds
`showTooltips` / `tooltipAttribute`, passed straight through to `rehype-citation`.

**Why**: same-page anchor popovers are useless; `showTooltips`/tooltip-decoding power the
hover-tooltips on `(Author, Year)` citation spans.

**Diverges from ale.ms**: ale.ms splits this into two separate local-plugin forks by concern
(`sup > a` suppression lives in its GFM/footnotes fork; tooltip handling lives in its citations
fork). gpunkt.org keeps both in the one citations fork — no 1:1 file mapping between the two repos
here.

## Short Title Support

**Files**: `quartz/util/fileTrie.ts:7` (`FileTrieData.shortTitle`), `:31-41` (`displayName`
getter), `quartz/util/ctx.ts:21` (`BuildTimeTrieData.shortTitle`), `:58` (extraction from
frontmatter), `local-plugins/content-index/src/emitter.ts:24` (`ContentDetails.shortTitle`), `:150`
(emit loop), `local-plugins/site-index/src/util/entries.ts:26-29` (homepage site index).

Adds an optional `shortTitle` frontmatter field threaded through build-time data structures.
`fileTrie.ts`'s `displayName` getter resolves
`displayNameOverride ?? (shortTitle ?? title) ?? fileSegmentHint ?? slugSegment`, falling back
cleanly when absent — powers server-rendered Explorer/Breadcrumbs. `ctx.ts` extracts it when
building the trie from all files. `content-index`'s emitter threads it into the client-fetched
`contentIndex.json`. `site-index` (homepage phone-book listing) reads it directly from frontmatter.

**Why**: per inline comment, "for Zotero sources" — long imported bibliographic titles (e.g. a full
German book title) get a compact nav display like "Ahrens (2017)", while the full title still shows
in the page's own H1.

**Known gap**: `local-plugins/recent-notes/src/components/RecentNotes.tsx:120` reads only
`page.frontmatter?.title`, no `shortTitle` fallback — ale.ms hit and fixed the identical gap in its
own RecentNotes fork. Low-risk for now since gpunkt.org's content model (a dictionary) doesn't
appear to use Zotero long-title sources in practice, but if a `shortTitle`d entry ever shows up in
"Zuletzt bearbeitet" looking wrong, this is why.

## German Locale (Citations plugin config)

**File**: `quartz.config.yaml` (`configuration.locale: de-DE`, and the citations plugin entry —
`csl: apa`, `showTooltips: true`, `tooltipAttribute: data-tooltip`, `linkCitations: false`,
`suppressBibliography: false`).

Produces German-formatted citations/bibliography (German connectives, date/name ordering) matching
the site's German content. `@quartz-community/citations` under v5 auto-derives the correct CSL
locale from `configuration.locale: de-DE` alone — the old v4-era hardcoded CSL-locale-XML URL is
gone, correctly not carried forward in the v5 config.

## Zotero Styling

**File**: `quartz/styles/custom.scss` — three areas:

- Dictionary-entry footnotes (~line 586 on): compact spacing, orange (`#ee683d`, light) /
  neon-green (`#39ff14`, dark) footnote markers and superscript links, `.footnote-highlighted` /
  `:target` background highlight, hidden backrefs. Scoped to `article.dictionary-entry`.
- Global bibliography (`.csl-entry`, ~line 604 on): hanging indent, popover suppression on
  `sup a`, hidden backrefs.
- Citation span + tooltip system (`[data-tooltip]`, ~line 753 on): dotted underline, `cursor: help`,
  opacity fade, plus a pure-CSS tooltip via `content: attr(data-tooltip)` on `::after`
  (`:hover`-triggered, no JS), themed via a `[saved-theme="..."]` attribute selector.

**Why**: book-like typographic treatment for dictionary-entry content (no `↩` backlinks, colored
footnote markers, hanging-indent bibliography), plus zero-JS citation tooltips.

**Diverges from ale.ms**: ale.ms's Zotero styling covers substantially more surface — 8 highlight
color classes (`mark.hltr-*`, light/dark variants), a full `article.literature-note` design system
(lettered highlight numbering, `Abb. N` figure captions), and a skeuomorphic 3D book-cover effect
for Zotero book covers. None of that exists in gpunkt.org
(`grep -E "hltr|literature-note|book-cover" quartz/styles/custom.scss` returns nothing) —
gpunkt.org's content model (a dictionary) doesn't use Zotero "literature notes" the way ale.ms's
Zettelkasten does; this is a deliberate scope difference, not a migration gap.

## Graph: `local-plugins/graph` needs its own `.gitignore`

**File**: `local-plugins/graph/.gitignore` (must exist, listing `dist/`).

Every other `local-plugins/*` fork has its own `.gitignore` excluding `dist/`; the plugin installer
(`quartz/cli/plugin-git-handlers.js`'s `hasPrebuiltDist()`/`needsBuild()`) checks for that file's
_existence on disk_ to decide whether an existing `dist/` is a stale build artifact to rebuild, or a
permanently "pre-built" package to leave alone. Without it, any machine that already has a `dist/`
on disk (from a previous install) will never rebuild that plugin again, even after `src/` changes —
this exact bug bit ale.ms's `local-plugins/site-index` once (fixed in commit `7fab863`), and its
`local-plugins/graph` a second time (2026-08-01: missing `.gitignore` there left it pinned to a
stale, pre-fix `@quartz-community/utils`, which lacked a `decodeURI()` fix and silently broke the
graph's node labels on any slug containing non-ASCII characters). gpunkt.org's own
`local-plugins/graph` already has its `.gitignore` and was unaffected — this entry exists so it
stays that way, and as a template for any future fork. If you ever fork a new plugin into
`local-plugins/`, copy an existing plugin's `.gitignore` into it and `git add -f` it (the root
`.gitignore` excludes all nested `.gitignore` files by design — plain `git add` silently drops it).

## Bases + Canvas: full-width layout

**File**: `quartz/styles/custom.scss` (top-of-file "Page max width" block, plus one rule near the
`::-webkit-scrollbar` section).

Stock config had a blanket `.page { max-width: 1280px !important; }`, which clipped both `.canvas`
and `.base` pages to the normal article measure — `@quartz-community/canvas-page` ships its own
`frame: "canvas"` full-bleed layout, but this override was fighting it, and `bases-page` has no
frame of its own to fight back with at all. Ported ale.ms's full fix wholesale (2026-08-01, prompted
by `Mechanismen-Atlas.canvas` and `Wörterbuch-Index.base` landing in `content/` for the first time):
`.page:not([data-frame="canvas"])` scopes the 1280px cap away from canvas pages; `.page:has(.bases-page)`
gets `max-width: none` instead; plus the box-sizing/overflow-y/scrollbar fixes ale.ms had already
found by hand in devtools (double-scrollbar from `.canvas-frame`'s content-box sizing fighting the
sidebar's padding, and from the Explorer's own `ul.overflow` fighting the vendor's
`.explorer-content` overflow rule). See ale.ms's own `custom.scss` for the byte-identical rules and
inline rationale.

**Why**: match ale.ms's edge-to-edge presentation for these two page types instead of the default
narrow article column, which reads badly for a wide table or a spatial canvas.

## Bases filter gotcha: `cssclasses` and `tags` are not what you typed

**Not a code change here** — this is knowledge for anyone editing a `.base` file in the content repo
(`gpunkt-woerter`, mounted locally at `/Users/alemsabic/Desktop/MEMEX/WÖRTER`), recorded here because
CUSTOM-MODIFICATIONS.md is the durable spot and that repo's own `CLAUDE.md` is purely editorial.

`@quartz-community/note-properties` (gpunkt.org's frontmatter parser — see its "load-bearing"
config comment in `quartz.config.yaml`) silently rewrites two frontmatter fields as it parses, no
matter how you wrote them in the source file:

- `cssclasses: dictionary-entry` (a scalar) becomes the array `["dictionary-entry"]` at runtime.
- Every entry in `tags:` is slugified — lowercased (`Unwort2023` → `unwort2023`), among other
  transforms.

`@quartz-community/bases-page`'s `==` operator is strict (`===`) — an array is never `==` a string,
so `cssclasses == "dictionary-entry"` silently matches nothing (all views render "No data found.",
not an error). Use `cssclasses.contains("dictionary-entry")` instead. Same trap for any
`tags.filter(value.startsWith("Unwort"))`-style formula or filter: match against the lowercased
form (`"unwort"`), not what's actually typed in the frontmatter. Found and fixed 2026-08-01 in
`Wörterbuch-Index.base` (all 5 views were empty, plus the `Mechanismen`/`Unwort d. Jahres` formula
columns were silently wrong even where a view did render) — confirmed via a real `npx quartz build`
against real content, not just by reading the plugin docs. ale.ms's own `Quellen-Index.base` doesn't
hit this — it filters on `file.hasProperty("citekey")` and plain scalar fields (`status`,
`itemType`), never on `cssclasses` or a case-sensitive `tags` match — so no equivalent fix was
needed there.
