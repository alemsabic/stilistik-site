# Visueller Refresh: Typografie, Farben, Hintergrund

**Status:** approved, ready for implementation plan
**Datum:** 2026-08-06

## Kontext

stilistik.org positioniert sich als moderne Gegenposition zu den bestehenden
Stilistiken (Engel, Reiners, Schneider — alle veraltet oder belastet). Diese Spec
setzt die Design-Seite dieser Positionierung um: Typografie, Farben, Hintergrund.
Content und Linter-Feature sind nicht Teil dieser Spec.

## 1. Typografie

### Problem

`quartz.config.yaml` setzt bereits `header: Geist Pixel`, `body: IBM Plex Mono`
(uncommitted, lokal gesetzt). Geist Pixel hat aber **keine `wght`-Achse** — laut
Google-Fonts-Metadata ist die einzige variable Achse `ELSH` (Element Shape,
0–100). Alle `font-weight: 900/700/500`-Regeln auf `h1`–`h6` in `custom.scss`
(die alle über `--headerFont` = Geist Pixel laufen, siehe `base.scss:398-405`)
greifen daher **nie** — der Browser bekommt vom aktuellen Pipeline-Pfad
(`fonts.googleapis.com/css2`, `cdnCaching: true`) ohnehin nur die statische
Default-Instance bei `ELSH=0`; Google Fonts' CSS2-Endpunkt generiert
Range-Instanzen nur für Standard-Achsen (`wght`, `wdth`, `ital`, `slnt`, `opsz`),
nicht für Custom-Achsen wie `ELSH`.

`ELSH` ist außerdem **keine Intensitätsachse** ("normal → pixelig") — verifiziert
gegen die echte variable Datei (`vercel/geist-font`,
`fonts/GeistPixel/variable/GeistPixel[ELSH].ttf`, Commit `10dc765` — dieselbe
Datei, die auch Google Fonts intern ausliefert) und deren STAT-Tabelle
(`sources/config-GeistPixel.yaml`). Sie wählt zwischen fünf benannten
Pixel-Bausteinformen:

| Name             | ELSH-Wert |
|------------------|-----------|
| Regular / Square | 0 / 1     |
| Circle           | 20        |
| Grid             | 40        |
| Triangle         | 60        |
| Line             | 80        |

Laut offizieller Google-Fonts-Beschreibung ist der Font "made for decorative
use in headlines, logos, and other display contexts" — über den gesamten
Achsenbereich hinweg pixelig, kein Wert nähert sich "normaler" Form an. Im
Live-Test mit dem echten Font-File (H1- und H3-Größe, `1.75rem`/`1.12rem`)
bestätigt: alle fünf Stile bleiben bei diesen Heading-Größen gut lesbar, die
Unterschiede zwischen den Stilen wirken bei kleiner Größe nur minimal. Da die
Seite praktisch nie unter H3 geht, ist Lesbarkeit bei H4–H6 kein
Entscheidungskriterium.

Zusätzlich: `cdnCaching: true` bindet bei jedem Seitenaufruf per
`<link rel="stylesheet" href="fonts.googleapis.com/...">` (`Head.tsx:51-55`)
direkt gegen Googles Server — die IP-Adresse jedes Besuchers geht ohne
Einwilligung an Google. Bekanntes DSGVO-Problem (LG München I, 2022).

### Entscheidung

Alle drei Fonts (Geist Pixel, IBM Plex Mono, JetBrains Mono) werden self-hosted.

- `quartz.config.yaml`: `theme.fontOrigin` von `googleFonts` → `local`.
  - Damit greift in `Head.tsx:51` und `componentResources.ts:285` keiner der
    beiden `fontOrigin === "googleFonts"`-Zweige mehr — keine Google-Requests
    mehr, `cdnCaching` wird dadurch bedeutungslos (Wert kann bleiben, wirkt aber
    nirgends mehr; optional zur Klarheit auf `false` setzen).
  - Laut Codekommentar in `componentResources.ts:283-284` übernimmt bei
    `fontOrigin: local` niemand automatisch das Laden — @font-face-Regeln
    schreibt das Projekt selbst.
- Neue Datei `quartz/styles/fonts.scss`, per `@use "./fonts.scss";` am Kopf von
  `custom.scss` eingebunden (Sass `@use` nimmt die Top-Level-CSS-Regeln der
  benutzten Datei mit in die kompilierte Ausgabe auf — gleiches Muster wie
  `base.scss`, das `variables.scss`/`syntax.scss`/`callouts.scss` einbindet).
  Enthält drei `@font-face`-Blöcke:
  - `font-family: "Geist Pixel"` — die echte variable Datei aus
    `vercel/geist-font`, Pfad `fonts/GeistPixel/variable/GeistPixel[ELSH].ttf`
    (Commit `10dc765`, OFL-lizenziert) — nicht die von Google Fonts CDN
    servierte statische Instanz.
  - `font-family: "IBM Plex Mono"` — Gewichte/Stile, die tatsächlich gebraucht
    werden (400, 400 italic, 600, 600 italic — IBM Plex Mono liegt typischerweise
    als statische Weight-Dateien vor, nicht als eine variable Datei).
  - `font-family: "JetBrains Mono"` — JetBrains stellt offiziell eine variable
    Datei (wght 100–800) bereit; die einer Sammlung statischer Gewichte
    vorziehen, wenn verfügbar.
  - Alle als `.woff2` (Geist Pixel ggf. aus dem TTF konvertieren, falls kein
    offizielles woff2 vorliegt), `font-display: swap`.
  - Dateien liegen unter `quartz/static/fonts/` (analog zum bestehenden
    `quartz/static/`-Muster, das 1:1 nach `public/static/` emittiert wird).
- Die CSS-Variablen `--headerFont`/`--bodyFont`/`--codeFont` werden weiterhin
  automatisch aus `theme.typography` generiert (`theme.ts:191-194`) — solange
  die `font-family`-Namen in `fonts.scss` exakt mit den Config-Namen
  übereinstimmen, ist keine weitere Verdrahtung nötig.
- `custom.scss`: die toten `font-weight: 900/700/500`-Deklarationen auf
  `h1`, `.page-title a`, `article h2`, `article.first-page h1 + h2`, `article h4`
  entfernen. Stattdessen **ein** einheitlicher Pixel-Stil für alle
  Geist-Pixel-Elemente (H1–H6, Page-Title, Tagline) über eine einzige SCSS-Variable
  in `fonts.scss` (z.B. `$geist-pixel-shape: 80;` — 80 = "Line", gewählt wegen des
  "IBM Feel" bei größeren Schriftgraden), referenziert per
  `font-variation-settings: 'ELSH' #{$geist-pixel-shape}`. Ein späterer
  Stilwechsel (z.B. zu Grid oder Triangle) ist damit eine Ein-Wert-Änderung an
  einer Stelle. Hierarchie zwischen Heading-Ebenen kommt weiterhin aus
  Schriftgröße und Farbe (bestehende Blau-/Orange-Regeln), nicht aus dem
  Pixel-Stil selbst.
- IBM Plex Mono (Body) und JetBrains Mono (Code) haben echte `wght`-Achsen —
  bestehende `font-weight`-Regeln auf Fließtext/Code (nicht auf `h1`–`h6`)
  bleiben unverändert korrekt, nur die Quelle der Font-Datei ändert sich.

## 2. Farben

`quartz.config.yaml`, `theme.colors`:
- `lightMode.light`: `#d4d4d4` → `#ffffff`
- `darkMode.light`: `#0a1967` → `#000000`

Reines Schwarz/Weiß statt Off-Black/Off-White (Korrektur nach initialer
Empfehlung) — passt besser zum kompromisslos cleanen Look.

Alle anderen Farbwerte (Akzente Blau `#3347cb`/Orange `#ee683d`, Text- und
Grautöne) bleiben unverändert.

## 3. Noise entfernen

`quartz/styles/custom.scss`, Zeilen 249–266 (`body::before`-Block mit
`background-image: url("/static/noise.png")` und der zugehörige
`[saved-theme="dark"] body::before { opacity: 0.5; }`-Block) komplett löschen.
`quartz/static/noise.png` bleibt als ungenutzter Asset liegen (kein
Referenzierungsfehler, kein Zwang zum Löschen).

## 4. Senkrechte Linien im Hintergrund

Ersetzt den entfernten Noise-Effekt als dezentes visuelles Signal. Per
visuellem Vergleich bestätigt (Variante C: 80px Abstand, sichtbar aber sehr
blass, nah am Deutsche-Nationalbibliothek-Buchumschlag-Referenzbild).

Direkt als `background-image` auf `body` (kein zusätzliches Pseudo-Element
nötig, da kein Blend-Mode gebraucht wird — im Gegensatz zum alten
Noise-`::before`):

```scss
body {
  background-image: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.08) 0 1px,
    transparent 1px 80px
  );
}

[saved-theme="dark"] body {
  background-image: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0 1px,
    transparent 1px 80px
  );
}
```

## 5. Tagline

`quartz.config.yaml`, `configuration.pageTitleSuffix`:
→ `"Die moderne Stilistik — für professionelles Deutsch, lesbar von Mensch und Maschine."`

## Out of Scope

- Farbe der Überschriften (Blau/Orange je Theme) — unverändert, nicht Teil
  dieser Anfrage.
- Content, Linter-Feature — separate Projekte.
- Automatisiertes Font-Fetching für `fontOrigin: local` (à la der bestehenden
  `googleFonts`-Pipeline in `componentResources.ts`) — Dateien werden für
  dieses Projekt einmalig manuell besorgt und eingecheckt, kein Build-Tooling
  dafür.
