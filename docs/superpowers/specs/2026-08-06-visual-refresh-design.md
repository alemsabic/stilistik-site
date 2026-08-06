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

### Entscheidung (überarbeitet: volle Geist-Familie statt Mix)

Statt Geist Pixel über die gesamte Heading-Hierarchie (H1–H6) zu spannen, wird
die Rollenverteilung auf die volle Geist-Familie umgestellt — alle vier
Font-Rollen kommen dann aus zueinander passenden, von Vercel bzw. JetBrains
offiziell gepflegten Font-Familien:

| Rolle                          | Font          | Wo im Code                                                        |
|---------------------------------|---------------|---------------------------------------------------------------------|
| `title` (H1, Page-Title, Tagline) | Geist Pixel  | neuer `theme.typography.title`-Slot (aktuell ungenutzt)             |
| `header` (H2–H6)                | Geist         | bestehender `theme.typography.header`-Slot                          |
| `body` (Fließtext)               | Geist Mono    | bestehender `theme.typography.body`-Slot                            |
| `code`                           | JetBrains Mono| bestehender `theme.typography.code`-Slot (unverändert)              |

Das löst das H3–H6-Lesbarkeitsrisiko an der Wurzel: Geist Pixel wird nur noch
dort eingesetzt, wofür Display-/Pixel-Fonts gemacht sind (Wortmarke/H1), nicht
mehr über kleine Heading-Ebenen gespannt. H2–H6 laufen auf `Geist`, einem
normalen Sans mit echter `wght`-Achse (100–900) — keine Pixel-Ästhetik, keine
Lesbarkeitsfrage mehr. `Geist Mono` ersetzt `IBM Plex Mono` als Body-Font,
näher an der Gesamtfamilie (selbes Designsystem wie Geist/Geist Pixel).

Verifiziert (`google/fonts`-Repo, `ofl/geist/` und `ofl/geistmono/`): beide
Familien liegen als je eine variable Datei pro Schnitt vor —
`Geist[wght].ttf` + `Geist-Italic[wght].ttf`, `GeistMono[wght].ttf` +
`GeistMono-Italic[wght].ttf`, jeweils `wght` 100–900. Weniger Dateien als der
ursprüngliche IBM-Plex-Plan (dort 4 statische Gewichte nötig), weil beides
echte Variable Fonts sind.

Alle vier Fonts werden self-hosted (Grund unverändert: DSGVO — siehe oben).

- `quartz.config.yaml`: `theme.fontOrigin` von `googleFonts` → `local`;
  `typography.title: Geist Pixel` (neu), `typography.header: Geist` (war
  `Geist Pixel`), `typography.body: Geist Mono` (war `IBM Plex Mono`),
  `typography.code: JetBrains Mono` (unverändert).
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
  Enthält `@font-face`-Blöcke für alle vier Fonts:
  - `font-family: "Geist Pixel"` — die echte variable Datei aus
    `vercel/geist-font`, Pfad `fonts/GeistPixel/variable/GeistPixel[ELSH].ttf`
    (Commit `10dc765`, OFL-lizenziert) — nicht die von Google Fonts CDN
    servierte statische Instanz.
  - `font-family: "Geist"` — `google/fonts`, `ofl/geist/Geist[wght].ttf` +
    `Geist-Italic[wght].ttf` (je ein `@font-face`-Block, `font-weight: 100 900`).
  - `font-family: "Geist Mono"` — `google/fonts`, `ofl/geistmono/GeistMono[wght].ttf`
    + `GeistMono-Italic[wght].ttf` (gleiches Muster).
  - `font-family: "JetBrains Mono"` — `google/fonts`, `ofl/jetbrainsmono/JetBrainsMono[wght].ttf`
    + `JetBrainsMono-Italic[wght].ttf`.
  - Alle als `.woff2` (aus den TTF-Quellen konvertiert, z.B. via `npx ttf2woff2`
    — verifiziert: reduziert Geist Pixel von 3.6 MB TTF auf ~41 KB WOFF2),
    `font-display: swap`.
  - Dateien liegen unter `quartz/static/fonts/` (analog zum bestehenden
    `quartz/static/`-Muster, das 1:1 nach `public/static/` emittiert wird).
- Die CSS-Variablen `--titleFont`/`--headerFont`/`--bodyFont`/`--codeFont`
  werden weiterhin automatisch aus `theme.typography` generiert
  (`theme.ts:191-194`) — solange die `font-family`-Namen in `fonts.scss` exakt
  mit den Config-Namen übereinstimmen, ist keine weitere Verdrahtung nötig.
- `custom.scss`: `--titleFont` und `--headerFont` sind aktuell nicht getrennt
  verdrahtet — `base.scss:398-405` setzt `font-family: var(--headerFont)`
  einheitlich auf `h1`–`h6`, und `.page-title` in `custom.scss:114-117` setzt
  explizit `font-family: var(--headerFont) !important` (nicht `--titleFont`,
  obwohl es konzeptionell der Site-Titel ist). Für die Title/Header-Trennung:
  - `.page-title` (custom.scss:116): `var(--headerFont)` → `var(--titleFont)`.
  - Neue Regel `h1 { font-family: var(--titleFont) !important; }` in
    `custom.scss` (H1 aus dem geerbten `--headerFont` der `h1,h2,h3,h4,h5,h6`-Sammelregel
    herausziehen; H2–H6 bleiben unverändert auf `--headerFont` = Geist).
  - `.tagline` (custom.scss:395) nutzt bereits `var(--titleFont)` — keine Änderung nötig.
  - Der Drop-Cap-Block (`h2:has(.heading-badge) + p::first-letter`,
    custom.scss:1013-1023) nutzt explizit `var(--headerFont)` mit
    `font-weight: 900` — da dieses Element groß (3.4em) und dekorativ ist,
    genau wie H1 auf `var(--titleFont)` umstellen statt auf Geist (H2-Ebene).
- Alle toten `font-weight: 900/700/500`-Deklarationen auf Geist-Pixel-Elementen
  entfernen (`h1`, `.page-title a`, Drop-Cap) und **auf allen vier
  `--titleFont`-Elementen** (`h1`, `.page-title a`, `.tagline`, Drop-Cap) —
  auch dort, wo bisher kein `font-weight` stand (`.tagline`), sonst rendert
  dieses Element auf dem Achsen-Default `ELSH=0` statt dem gewählten Stil —
  `font-variation-settings: 'ELSH' #{$geist-pixel-shape}` setzen, mit
  `$geist-pixel-shape: 80;` (= "Line", gewählt wegen des "IBM Feel" bei
  größeren Schriftgraden) als einzige SCSS-Variable in `fonts.scss` — ein
  späterer Stilwechsel ist damit eine Ein-Wert-Änderung an einer Stelle.
- `article h2`/`article h4` (custom.scss:194-201, 219-225): die toten
  `font-weight: 500`-Zeilen entfernen, keine Ersatzregel nötig — Geist hat eine
  echte `wght`-Achse, die vorhandenen `font-weight`-Werte auf H2–H6 greifen
  jetzt automatisch korrekt (kein Sonderfall mehr).
- Geist Mono (Body), Geist (H2–H6) und JetBrains Mono (Code) haben echte
  `wght`-Achsen — bestehende `font-weight`-Regeln auf Fließtext/H2–H6/Code
  bleiben funktional korrekt, nur die Font-Quelle ändert sich.

## 2. Farben

### Hintergrund

`quartz.config.yaml`, `theme.colors`:
- `lightMode.light`: `#d4d4d4` → `#ffffff`
- `darkMode.light`: `#0a1967` → `#000000`

Reines Schwarz/Weiß statt Off-Black/Off-White (Korrektur nach initialer
Empfehlung) — passt besser zum kompromisslos cleanen Look.

### Überschriften/Titel: monochrom statt Blau/Orange

Aktuell setzt `custom.scss:167-187` `h1`–`h6` und `.page-title a` explizit auf
`#3347cb` (Light) / `#ee683d` (Dark) — ein Farb-Akzent, der nicht mehr zum
"schonungslos cleanen" Konzept passt. Neu: Überschriften und Titel bekommen
dieselbe Farbe wie der Hintergrund-Gegenpol — reines Schwarz auf hellem,
reines Weiß auf dunklem Grund:

- `[saved-theme="light"] h1, h2, h3, h4, h5, h6, .page-title a` → `#000000`
  (ersetzt `#3347cb`)
- `[saved-theme="dark"] h1, h2, h3, h4, h5, h6, .page-title a` → `#ffffff`
  (ersetzt `#ee683d`)

Bestehende `--darkgray`/`--dark`-Werte (Body-Text: `#111111`/`#222222` Light,
`#eeeeee`/`#dddddd` Dark) bleiben unverändert — Überschriften werden dadurch
bewusst dunkler/heller als der Fließtext, nicht identisch mit ihm.

### Links/Akzent: von Farbe auf Grau

Der Blau/Orange-Akzent verschwindet nicht ersatzlos, sondern wandert auf die
einzige Stelle, wo Farbe noch eine Funktion hat — Links. `secondary`/`tertiary`
in `theme.colors` treiben laut `theme.ts:217-272` bereits zentral
`--link-color`, `--link-color-hover`, `--text-accent`, `--tag-color`,
`--nav-item-color-active`, `--icon-color-active` — ein einziger Config-Wechsel
wirkt sich also korrekt auf alle Link-artigen Elemente aus, keine Einzelregeln
nötig.

- `lightMode.secondary`: `#3347cb` → `#444444` (Link-Grundfarbe)
- `lightMode.tertiary`: `#5468e0` → `#222222` (Hover — wiederverwendet den
  bestehenden `--darkgray`-Wert, dunkelt beim Hover Richtung Body-Text-Kontrast)
- `darkMode.secondary`: `#ee683d` → `#cccccc`
- `darkMode.tertiary`: `#f58a68` → `#eeeeee` (Hover — wiederverwendet
  `--darkgray` im Dark-Theme, hellt Richtung Body-Text-Kontrast auf)

Bestätigt (Nutzerentscheidung): Link-Grundfarbe dezent von der
Überschriften-Extremfarbe abgesetzt (`#444444` neben `#000000` Light,
`#cccccc` neben `#ffffff` Dark) — erkennbar als eigene Ebene, aber nicht laut.
Hover verstärkt Richtung Body-Text-Kontrast statt Richtung der (jetzt
entfernten) Bunt-Akzentfarbe.

`--accent-h/s/l` (`theme.ts:275-277`, aus `secondary` berechnet) werden dadurch
zu einem neutralen Grauton (Sättigung 0) — unproblematisch, keine bekannte
Stelle im Code verlangt einen bunten Hue hier.

**Nebeneffekt, bewusst in Kauf genommen:** Light- und Dark-Theme verlieren
ihre bisherige farbliche Eigenständigkeit (Blau vs. Orange) und werden zu
reinen Invertierungen voneinander. Das ist im Sinne von "schonungslos clean"
gewollt, aber der Punkt, an dem dieser Unterschied verloren geht.

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

- Content, Linter-Feature — separate Projekte.
- Automatisiertes Font-Fetching für `fontOrigin: local` (à la der bestehenden
  `googleFonts`-Pipeline in `componentResources.ts`) — Dateien werden für
  dieses Projekt einmalig manuell besorgt und eingecheckt, kein Build-Tooling
  dafür.
