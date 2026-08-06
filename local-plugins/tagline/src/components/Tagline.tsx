import type { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "@quartz-community/types";
import { classNames } from "@quartz-community/utils";

// Mobile gets a shorter tagline than pageTitleSuffix — the full version wraps
// too eagerly at narrow widths. Not config-driven: this is a display-only
// adaptation of the same tagline, not an independent piece of site content.
const shortTagline = "Besseres Deutsch.";

const Tagline: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "tagline", "desktop-only")}>
      <span class="tagline-full">{cfg.pageTitleSuffix ?? ""}</span>
      <span class="tagline-short">{shortTagline}</span>
    </div>
  );
};

export default (() => Tagline) satisfies QuartzComponentConstructor;
