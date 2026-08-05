# Bootstrap-Content + Sync-Pipeline (Teilprojekt 2)

**Status:** Genehmigt, 2026-08-05.

## Kontext

Pipeline lokal→GitHub→Cloudflare für `stilistik-site` ist laut `bootstrap.md` bereits verifiziert.
Offen ist der Content-Teil: `stilistik-regeln` (Teilprojekt 1, siehe
`2026-08-05-content-repo-structure-design.md`) existiert als leeres Repo, aber ohne Inhalt und ohne
Sync-Anbindung an `stilistik-site`. Ziel dieses Teilprojekts: ein bis zwei echte Dateien durch die
volle Kette schleusen (Content-Repo → Sync-Action → `stilistik-site/content/` → Cloudflare-Build →
live), um die Content-Pipeline end-to-end zu beweisen — nicht, das finale Design oder den vollen
Content zu liefern.

## Entscheidungen

- **`stilistik.org/README.md`** (dieses Repo) — Quartz-Boilerplate ersetzt durch die
  `hauptsatz/README.md`-Fassung mit getauschter Domain (stilistik.org statt hauptsatz.org).
- **`stilistik-regeln/README.md`** — Muster von `WÖRTER/README.md`: `draft: true`, Kurzbeschreibung,
  Struktur/Workflow/Deployment-Abschnitte, Links auf `stilistik-site` und `stilistik.org`.
- **Eine portierte Regel-Seite** (`stilistik-regeln/aktiv-statt-passiv.md`), Quelle
  `hauptsatz/docs/teil-i-stil/aktiv-statt-passiv.md` — einzige der 6 Kernregeln-Seiten, die dort
  fertig ist. MkDocs-Admonitions (`!!! vorher/nachher`) und `<div class="diff-grid" markdown>`
  werden zu einfachen Blockquotes konvertiert (reines GFM, kein Quartz-Plugin nötig). Frontmatter:
  `title`, `language: de`, `tags: [Aktiv-Passiv, Schneider]`.
- **`index.md` + `bibliography.bib`** in `stilistik-regeln` — Platzhalter-Pendants zu den aktuell in
  `stilistik.org/content/` liegenden Dateien. Nötig, weil der Sync-Job alles in `content/` löscht,
  was nicht aus dem Content-Repo kommt — ohne diese zwei Dateien würde der erste Sync
  `bibliography.bib` entfernen, das die Citations-Plugin-Config unconditional referenziert.
- **`.github/workflows/sync-to-quartz.yml`** in `stilistik-regeln`, adaptiert von
  `gpunkt-woerter/.github/workflows/sync-to-quartz.yml`: Trigger `push` auf `main`, checkt
  `alemsabic/stilistik-site` (`ref: v5`) mit `QUARTZ_REPO_TOKEN` aus, rsynct Content-Repo-Root nach
  `content/` (Ausnahmen: `.git*`, `.github`, `CLAUDE.md`, `README.md`), committet & pusht bei
  Änderungen.
- **`QUARTZ_REPO_TOKEN`** — fine-grained PAT, Scope nur `alemsabic/stilistik-site`,
  `Contents: Read and write`. Kann nicht per `gh` CLI erzeugt werden (kein API-Endpunkt für
  fine-grained PATs) — manueller Schritt für den User über
  github.com/settings/personal-access-tokens/new, danach `gh secret set QUARTZ_REPO_TOKEN --repo
  alemsabic/stilistik-regeln` (Wert über stdin-Prompt, nicht im Chat-Verlauf).

## Verifikation

Nach Setzen des Tokens: Commit/Push nach `stilistik-regeln` main → Sync-Action sollte automatisch
feuern → `stilistik-site/content/` aktualisiert sich → Cloudflare Pages baut automatisch →
Live-Check auf stilistik.org.

## Out of Scope

- Die restlichen 5 Kernregeln-Seiten (in `hauptsatz` selbst nur Platzhalter, kein echter Inhalt).
- Visuelles Diff-Grid-Styling (Admonition-CSS) — bewusst auf reines GFM reduziert, da Design noch
  nicht begonnen (siehe `CLAUDE.md`).
- Giscus-Setup, echte Content-Migration — bleiben wie in `bootstrap.md` vermerkt offen.
