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

- [x] Copy gpunkt.org's repo structure (`quartz/`, `local-plugins/`, `quartz.config.yaml`,
      `quartz.ts`, `quartz.lock.json`, `package.json`, etc.) into `stilistik.org/`, excluding
      `.git/`, `node_modules/`, `public/`, and gpunkt's actual `content/`. `quartz.lock.json` had
      gpunkt.org's absolute machine paths baked into its `resolved` fields — fixed via sed.
- [x] Replace `content/` with a minimal placeholder page (`content/index.md` + empty
      `content/bibliography.bib`, the latter needed because the citations plugin's
      `bibliographyFile` option points at it unconditionally).
- [x] Rename gpunkt→stilistik in `quartz.config.yaml` (pageTitle, baseUrl, giscus `baseUrl`/`repo`/
      `themeUrl`). Giscus plugin set to `enabled: false` (repoId/categoryId were gpunkt-specific,
      need fresh registration at giscus.app once ready). **Found and fixed a second leftover**:
      `local-plugins/tagline/src/components/Tagline.tsx` had gpunkt.org's actual tagline text
      hardcoded in source (not config-driven) — this is the kind of thing a blind sed pass over
      `quartz.config.yaml` alone would have missed; worth a `grep -ri "gpunkt"` sweep before any
      future "looks done" declaration on this repo.
- [x] Local build check — succeeded after the two content-dependency fixes above. All 18
      local-plugins built clean via `npx quartz plugin install --from-config`.
- [x] `gh repo create alemsabic/stilistik-site`, git init, initial commit, push to `v5` (set as
      default branch). No secrets or build artifacts in the initial commit (803 files, checked).
- [x] Cloudflare Pages project `stilistik-site` created via direct API call (native Git
      integration, source.type=github, same build_config as gpunkt-site). The GitHub App was
      already authorized for new repos under this account — no manual GitHub-side step needed.
      First deployment (ad-hoc trigger) succeeded; confirmed live at stilistik-site.pages.dev.
- [x] Custom domain `stilistik.org` attached to the Pages project via API.
- [ ] **BLOCKED**: the CNAME record pointing stilistik.org at the Pages project was not
      auto-created. Domain status stays `pending` / `CNAME record not set`. Root cause: the
      `wrangler` OAuth token used for all the API calls above has `zone:read` but not DNS
      record write scope — direct `zones/{id}/dns_records` calls return `Authentication error`
      (code 10000). The Cloudflare MCP servers connected earlier this session (broader consent,
      including account-level write) aren't reachable via this running session's tool set — they
      were registered mid-session and this process needs a restart to pick them up (same class of
      issue as the settings-watcher caveat for hooks). **Next step**: either restart this Claude
      Code session and retry via the `cloudflare-api`/`cloudflare-bindings` MCP tools, or add the
      CNAME manually in the Cloudflare dashboard (DNS → stilistik.org zone → CNAME `stilistik.org`
      → `stilistik-site.pages.dev`, proxied).
- [x] End-to-end pipeline test — done via the tagline-text fix (real bug found during setup, not a
      throwaway edit): local change → commit → push → Cloudflare auto-triggered a production build
      (no manual trigger needed, confirming the git-integration webhook works) → succeeded → change
      confirmed live at **stilistik-site.pages.dev**. The apex domain leg (stilistik.org itself)
      is what's blocked on the DNS item above — everything upstream of DNS is proven working.

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
