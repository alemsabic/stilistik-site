import type { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "@quartz-community/types";
import { classNames } from "@quartz-community/utils";

// Mobile gets a shorter tagline than pageTitleSuffix — the full version wraps
// too eagerly at narrow widths. Not config-driven: this is pageTitleSuffix's
// first sentence only, with the second ("Geschrieben für Mensch und Maschine.")
// dropped for space, not an independent piece of site content.
const shortTagline = "Moderne Stilistik für bessere Texte.";

const Tagline: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "tagline", "desktop-only")}>
      <span class="tagline-full">{cfg.pageTitleSuffix ?? ""}</span>
      <span class="tagline-short">{shortTagline}</span>
    </div>
  );
};

export default (() => Tagline) satisfies QuartzComponentConstructor;
