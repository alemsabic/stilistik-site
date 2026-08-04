import type { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "@quartz-community/types";
import { classNames } from "@quartz-community/utils";

const Tagline: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "tagline", "desktop-only")}>
      Reizwörter - Wahrheit ist Wortwahl.
    </div>
  );
};

Tagline.css = `
.tagline {
  font-size: 1.2rem;
  margin-top: 1rem;
  margin-bottom: 2.5rem;
  line-height: 1.1rem;
}
`;

export default (() => Tagline) satisfies QuartzComponentConstructor;
