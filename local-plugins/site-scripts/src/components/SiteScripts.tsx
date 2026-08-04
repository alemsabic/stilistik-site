import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types";
// @ts-expect-error - inline script import handled by Quartz bundler
import footnotesScript from "./scripts/footnotes.inline.ts";
// @ts-expect-error - inline script import handled by Quartz bundler
import tooltipsScript from "./scripts/tooltips.inline.ts";

// Renders nothing — exists purely to carry the two inline scripts below onto every page via
// afterDOMLoaded. No plugin currently owns cross-cutting afterDOMLoaded aggregation in v5, so a
// small component-only plugin placed anywhere in the layout is the simplest way to ship them.
const SiteScripts: QuartzComponent = () => null;

SiteScripts.afterDOMLoaded = `
  ${footnotesScript};
  ${tooltipsScript};
`;

export default (() => SiteScripts) satisfies QuartzComponentConstructor;
