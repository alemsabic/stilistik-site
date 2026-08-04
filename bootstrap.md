# stilistik.org — Bootstrap Plan

Status tracker for standing up the pipeline (Local → GitHub → Cloudflare → stilistik.org). Delete or
fold into `CLAUDE.md` once done — this is a working document, not permanent reference (see `CLAUDE.md`'s
"How this file is maintained" for why nothing here should linger once resolved).

## Decision (2026-08-04)

Clone **gpunkt.org**, not a blank Quartz v5 install, and not ale.ms. Rationale (discussed with user):

- gpunkt.org's `CUSTOM-MODIFICATIONS.md` + `upgrade.md` run ~462 lines vs. ale.ms's ~1872 — far less
  migration/gotcha baggage to carry forward.
- gpunkt.org has no Bases/Canvas trial or Explorer-pinning complications that ale.ms is still
  carrying.
- Content shape matches: gpunkt.org's `dictionary-entry` type (Politisches Lexikon) is structurally
  closer to a stylistics/language-rules reference than ale.ms's Zettelkasten+Zotero setup.
- All the painful v4→v5 migration work (footnotes, citations, `shortTitle` fallback, the
  `--from-config` Cloudflare build flag gotcha) is already solved and battle-tested in gpunkt.org —
  redoing it from scratch would just risk re-hitting the same walls.

**Scope for this pass**: pipeline only (local edit → GitHub → Cloudflare Pages → live at
stilistik.org). Content and visual design (theme, typography, tagline) are explicitly deferred —
placeholder content only, enough to prove the pipeline works end-to-end.

## Steps

- [ ] Copy gpunkt.org's repo structure (`quartz/`, `local-plugins/`, `quartz.config.yaml`,
      `quartz.ts`, `quartz.lock.json`, `package.json`, etc.) into `stilistik.org/`, excluding
      `.git/`, `node_modules/`, `public/`, and gpunkt's actual `content/` (real dictionary content —
      must not ship to stilistik.org). Preserve the `CLAUDE.md` / `.mcp.json` / `.claude/` already
      written here.
- [ ] Replace `content/` with a single minimal placeholder page — just enough for a build to
      succeed and something to appear at stilistik.org root.
- [ ] Rename gpunkt→stilistik: site title/tagline in `quartz.config.yaml`, `package.json` name,
      README. **Giscus (comments)**: disable or leave unconfigured for now — it's bound to a specific
      GitHub repo with Discussions enabled and needs fresh registration at giscus.app once
      `stilistik-site` exists; not required for the pipeline test.
- [ ] Local build check: `npm install`, `npx quartz plugin install --from-config && npx quartz build`
      — must succeed before anything gets pushed anywhere.
- [ ] `gh repo create alemsabic/stilistik-site` (public, matching sibling repos), git init, initial
      commit, push. Default/production branch: `v5`, matching ale.ms/gpunkt.org convention (not
      `main`) — keeps the three repos consistent for future cross-porting.
- [ ] Cloudflare Pages: new project connected to `alemsabic/stilistik-site` via native Git
      integration (not GitHub Actions — matches how ale.ms/gpunkt.org actually deploy, see their
      `CLAUDE.md`s). Build command: `npx quartz plugin install --from-config && npx quartz build`.
      Output directory: `public`. Production branch: `v5`.
- [ ] Attach `stilistik.org` custom domain (already on this Cloudflare account) to the new Pages
      project.
- [ ] End-to-end test: trivial edit to the placeholder page → commit → push → confirm Cloudflare
      build succeeds → confirm change is live at stilistik.org.

## Explicitly deferred (next pass, not this one)

- Content repo (`alemsabic/stilistik-regeln`, local clone at
  `/Users/alemsabic/Desktop/MEMEX/Projekte/stilistik/`) and the `sync-to-quartz.yml` GitHub Action
  wiring it to this repo's `content/` — needs a `QUARTZ_REPO_TOKEN` fine-grained PAT, same pattern as
  the sister projects. Skipped for now since it's a content-pipeline concern, not the
  local→GitHub→Cloudflare pipeline this pass is about.
- Giscus comments setup.
- Theme/typography/visual identity — currently inherits gpunkt.org's "Clinical Cold" theme verbatim;
  revisit once content work starts.
- Real content migration into `content/`.
