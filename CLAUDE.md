# Claude Code Instructions - Quartz Repository (stilistik.org)

## ⚙️ How this file is maintained

This file holds **only durably-true facts about the current state of the project** — config,
architecture, conventions, policies. It is read at the start of every session, so keep it lean and
current, not a historical record.

**Does NOT belong here** (put it elsewhere, or delete it once it's done its job):

- Session-by-session update logs ("Session 16 Updates...") → belongs in git commit messages.
- In-progress migration/project status → belongs in `upgrade.md` (or wherever the relevant runbook
  lives) while active; once finished, replace with a one-line pointer here, don't keep the play-by-play.
- Resolved TODOs, closed bugs, decisions already made → delete once resolved, don't leave a
  checked-off trail. Git history has the trail if anyone needs it.
- One-time debugging narratives ("Issue → Root Cause → Alternatives Considered → Resolution") →
  belongs in a commit message or a dedicated runbook (`upgrade.md`). If the _outcome_ is a rule that
  must survive future refactors, that rule belongs in **`CUSTOM-MODIFICATIONS.md`**, stated plainly,
  not narrated.

**Does belong here**: what's true right now (config, file structure, deployment setup), policies
that apply to every session (jDocMunch usage), and pointers to where the detailed, change-prone
stuff actually lives.

---

## Sister Projects

This project, **Schmutz** (`schmutz.schund.org`, local path `/Users/alemsabic/Desktop/ale.ms`), and **gpunkt.org**
(`/Users/alemsabic/Desktop/gpunkt.org`) are all Quartz v5 sites maintained by the same person, kept
in close alignment on purpose — all three follow this same `CLAUDE.md` / `CUSTOM-MODIFICATIONS.md` /
`upgrade.md` structure. Schmutz and gpunkt.org are both live and fully migrated to Quartz v5; this
project is still being bootstrapped (see Project Status below). When you land an improvement here —
tooling, config conventions, a reusable component (not content) — consider whether it should be
ported to the other two, and vice versa (their `CLAUDE.md`s document what already exists and is
worth reusing here instead of re-solving from scratch).

---

## ⚠️ Important: Two-Repository Architecture (planned)

This repository will handle **PRESENTATION ONLY** (Quartz static site generator), matching Schmutz
and gpunkt.org.

**Content will be managed separately**:

- Content Repository: `stilistik-regeln` (not yet created on GitHub)
- Local path: `/Users/alemsabic/Desktop/MEMEX/Projekte/stilistik/` (folder created, empty — no git
  repo initialized yet)
- Intended to auto-sync to this repo's `content/` folder via a GitHub Action in the content repo,
  same pattern as `alems-notizen` → Schmutz and `gpunkt-woerter` → gpunkt.org.
- **Once set up: DO NOT edit files in `content/` directly** — same rule as the sister projects.

### Repository Focus (once bootstrapped)

- ✅ Design, styling, layout, Quartz configuration, UI components
- ❌ Content (managed in the separate repo above)

---

## Project Status

**Pipeline bootstrapped (2026-08-04); content and design not started.** This repo was cloned from
gpunkt.org's Quartz v5 setup (not a fresh install — see `bootstrap.md` for why and for the full
rename/setup checklist, kept there rather than replayed here). Presentation side is live and
verified end-to-end. Content side is not: `content/` holds only a placeholder page, and the content
repo doesn't exist yet.

**Still open**:

- Content repo `alemsabic/stilistik-regeln` — not created yet. Local folder exists but is empty, no
  git repo initialized: `/Users/alemsabic/Desktop/MEMEX/Projekte/stilistik/`.
- `sync-to-quartz.yml` GitHub Action (copy from `gpunkt-woerter` or `alems-notizen`, adjust target
  repo/branch) — not set up; needs a `QUARTZ_REPO_TOKEN` PAT once the content repo exists.
- Actual content and visual identity — currently inherits gpunkt.org's "Clinical Cold" theme and
  tagline text verbatim (renamed to placeholder strings only); revisit both once content work
  starts.

**Purpose** (best current understanding, confirm/refine once content work starts): stilistik.org —
German-language reference on stylistics/language rules ("Stilistik"/"Sprachregeln"), sibling in
spirit to gpunkt.org's dictionary-entry format. The content repo name `stilistik-regeln` was chosen
2026-08-04 over `stilistik-begriffe` (lexicon-of-terms framing) and `sprachregeln` (drops the site
name) — revisit if the actual content shape turns out closer to a term-by-term lexicon than a
rules/guidance reference.

## Deployment

**Platform**: Cloudflare Pages, native Git integration (matching Schmutz/gpunkt.org).

- **Repository**: https://github.com/alemsabic/stilistik-site
- **Branch**: `v5` (production + default, matching sister-project convention from the start —
  no v4 history here to carry along).
- **Project**: `stilistik-site`, custom domain `stilistik.org` attached and verified.
- **Build Command**: `npx quartz plugin install --from-config && npx quartz build` — same
  `--from-config` requirement as the sister projects, see their `CLAUDE.md`s for why it's not
  optional.
- **Output Directory**: `public`
- `upstream` git remote (`https://github.com/jackyzha0/quartz.git`) is set up, matching
  Schmutz/gpunkt.org, for whenever a future Quartz version upgrade is needed — see `upgrade.md` in
  either sister repo for the actual fetch/checkout/re-port mechanism (vendored core, not an npm
  dependency, so it's a manual process either way).

---

## Doc Exploration Policy (jDocMunch)

This project registers the `jdocmunch` MCP server (project-scoped, `.mcp.json`) for token-efficient
navigation of real documentation sets — e.g. the upstream [Quartz docs](https://github.com/jackyzha0/quartz)
or any other sizeable third-party docs needed while working on this repo. It indexes doc-like files
(Markdown, RST, HTML, OpenAPI specs, etc.) by section instead of requiring full-file reads.

**When to use it**:

- Before exploring an external documentation set (Quartz's own docs, a plugin's docs, a new
  dependency) — `index_repo` (GitHub) or `index_local` (on disk) first, then `search_sections` /
  `get_toc` to find the relevant part.
- To pull specific content once located — use `get_section` (or `get_sections` for several) with
  the section ID, rather than opening the whole file.

**Not for**: this repo's own `CLAUDE.md`, `CUSTOM-MODIFICATIONS.md`, or `README.md` — those are
kept small deliberately and should just be `Read` directly.

This is a manual convention, not an enforced hook. Use judgment: reach for jDocMunch specifically
when indexing genuine external documentation, not this repo's own short files.

---

## Notes

- No `jCodeMunch`/code-indexing MCP here by design — Schmutz and gpunkt.org removed it 2026-08-04 (it
  wasn't earning its keep for repos this size); don't re-add it without a fresh reason.
- `CUSTOM-MODIFICATIONS.md` here is still gpunkt.org's content verbatim (inherited via the clone,
  not yet re-reviewed for this repo) — accurate for the code as it stands today, but revisit once
  any local-plugins/quartz diverge from gpunkt.org's originals.
- Once content work starts, replace `upgrade.md`'s absence with either a real one (if a version
  upgrade happens) or leave it out — `bootstrap.md` already covers this repo's actual origin story,
  no need to fabricate migration history that didn't happen here.
