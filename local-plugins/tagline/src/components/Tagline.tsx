import type { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "@quartz-community/types";
import { classNames } from "@quartz-community/utils";

const Tagline: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "tagline", "desktop-only")}>
      {cfg.pageTitleSuffix ?? ""}
    </div>
  );
};

Tagline.css = `
.tagline {
  font-size: 1.2rem;
  margin-top: 1rem;
  margin-bottom: 2.5rem;
  line-height: 1.15;
}
`;

export default (() => Tagline) satisfies QuartzComponentConstructor;
