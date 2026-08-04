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

This project, **ale.ms** (`/Users/alemsabic/Desktop/ale.ms`), and **gpunkt.org**
(`/Users/alemsabic/Desktop/gpunkt.org`) are all Quartz v5 sites maintained by the same person, kept
in close alignment on purpose — all three follow this same `CLAUDE.md` / `CUSTOM-MODIFICATIONS.md` /
`upgrade.md` structure. ale.ms and gpunkt.org are both live and fully migrated to Quartz v5; this
project is still being bootstrapped (see Project Status below). When you land an improvement here —
tooling, config conventions, a reusable component (not content) — consider whether it should be
ported to the other two, and vice versa (their `CLAUDE.md`s document what already exists and is
worth reusing here instead of re-solving from scratch).

---

## ⚠️ Important: Two-Repository Architecture (planned)

This repository will handle **PRESENTATION ONLY** (Quartz static site generator), matching ale.ms
and gpunkt.org.

**Content will be managed separately**:

- Content Repository: `stilistik-regeln` (not yet created on GitHub)
- Local path: `/Users/alemsabic/Desktop/MEMEX/Projekte/stilistik/` (folder created, empty — no git
  repo initialized yet)
- Intended to auto-sync to this repo's `content/` folder via a GitHub Action in the content repo,
  same pattern as `alems-notizen` → ale.ms and `gpunkt-woerter` → gpunkt.org.
- **Once set up: DO NOT edit files in `content/` directly** — same rule as the sister projects.

### Repository Focus (once bootstrapped)

- ✅ Design, styling, layout, Quartz configuration, UI components
- ❌ Content (managed in the separate repo above)

---

## Project Status

**Not yet bootstrapped.** As of 2026-08-04, this directory contains no Quartz install, no git repo,
and no deployed site — just this `CLAUDE.md` and the MCP/skill setup below. Setting this project up
means, roughly (mirroring ale.ms/gpunkt.org's `upgrade.md` history rather than reinventing it):

- Initialize this repo (Quartz v5, not v4 — no need to repeat the sister projects' v4→v5 migration).
- Create `alemsabic/stilistik-regeln` on GitHub, init `/Users/alemsabic/Desktop/MEMEX/Projekte/stilistik/`
  as its local clone, set up the `sync-to-quartz.yml` GitHub Action (copy from `gpunkt-woerter` or
  `alems-notizen` and adjust the target branch/repo).
- Create `alemsabic/stilistik-site` (or similar) on GitHub for this presentation repo, wire up
  Cloudflare Pages (native Git integration, matching ale.ms/gpunkt.org — not GitHub-Actions-based
  deploy, see their `CLAUDE.md`s for why).
- Once live, replace this section with the sister projects' equivalent `Deployment` / `File
  Structure` / `Current Configuration` sections, filled in with this project's actual values.

**Purpose** (best current understanding, confirm/refine once content work starts): stilistik.org —
German-language reference on stylistics/language rules ("Stilistik"/"Sprachregeln"), sibling in
spirit to gpunkt.org's dictionary-entry format. The content repo name `stilistik-regeln` was chosen
2026-08-04 over `stilistik-begriffe` (lexicon-of-terms framing) and `sprachregeln` (drops the site
name) — revisit if the actual content shape turns out closer to a term-by-term lexicon than a
rules/guidance reference.

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

- No `jCodeMunch`/code-indexing MCP here by design — ale.ms and gpunkt.org removed it 2026-08-04 (it
  wasn't earning its keep for repos this size); don't re-add it without a fresh reason.
- Once this project is bootstrapped, keep this file, `CUSTOM-MODIFICATIONS.md`, and `upgrade.md` in
  the same shape as ale.ms/gpunkt.org — that's the whole point of the Sister Projects alignment.
