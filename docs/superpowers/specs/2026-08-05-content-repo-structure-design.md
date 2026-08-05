# Repo-Struktur: stilistik-regeln + stilistik-fabrik

**Status:** Genehmigt, 2026-08-05.

## Kontext

stilistik.org (dieses Repo) folgt dem Zwei-Repo-Muster von gpunkt.org/ale.ms: Präsentation
(Quartz, dieses Repo) getrennt von Content. Der Content-Ordner
`/Users/alemsabic/Desktop/MEMEX/Projekte/stilistik/` existiert bereits (leer, kein Git). Analog zu
`WÖRTER/` (öffentlich `gpunkt-woerter`, privat verschachtelt `wort-fabrik/`) und `NOTIZEN/`
(öffentlich `alems-notizen`, privat verschachtelt `zettel-fabrik/`, `bilder-fabrik/`) bekommt auch
stilistik ein öffentliches Content-Repo mit einem privat verschachtelten Produktions-Repo.

## Entscheidung

- **`alemsabic/stilistik-regeln`** (public) — lokal `/Users/alemsabic/Desktop/MEMEX/Projekte/stilistik/`,
  Branch `main`.
- **`alemsabic/stilistik-fabrik`** (private) — lokal verschachtelt als
  `Projekte/stilistik/stilistik-fabrik/`, eigenes Git-Repo, eigener Branch `main`, im `.gitignore`
  von `stilistik-regeln` ausgeschlossen.
- **`.gitignore`** von `stilistik-regeln`, analog `WÖRTER/.gitignore`: `stilistik-fabrik/`,
  `.DS_Store`, `.claude/`, `.obsidian/`, `.gemini/`, `CLAUDE.md`, `GEMINI.md` (interne Doku bleibt
  lokal, nicht öffentlich), Python-Artefakte (`__pycache__/`, `*.pyc`, `.venv/` etc.), `.env`,
  Editor-Ordner.
- **Initialer Commit**: nur `.gitignore` in `stilistik-regeln`. Kein README, kein Content — folgt in
  einem separaten Teilprojekt (Bootstrap/Verifikation der Pipeline).
- **`stilistik-fabrik`** bleibt vorerst leeres Skelett (nur `.git` + Remote) — Workflow-Doku
  (CLAUDE.md analog `wort-fabrik/CLAUDE.md`) und Tooling folgen mit dem Scraper-/Pipeline-
  Teilprojekt.

## Out of Scope (bewusst verschoben)

- `sync-to-quartz.yml` GitHub Action (stilistik-regeln → stilistik.org `content/`) — Teil des
  Bootstrap-Teilprojekts.
- README für `stilistik-regeln` — Teil des Bootstrap-Teilprojekts.
- CLAUDE.md/Tooling für `stilistik-fabrik` — Teil des Scraper-Pipeline-Teilprojekts.
- Der komplett neue, deutsch-spezifische Stil-Linter (Ersatz für Vale) — eigenständiges
  Software-Projekt, eigener Brainstorming-Durchlauf.
