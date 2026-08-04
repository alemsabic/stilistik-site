import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
import { classNames } from "../util/lang";
import { i18n } from "../i18n";
import legacyStyle from "./styles/legacyToc.scss";
import modernStyle from "./styles/toc.scss";
// @ts-expect-error - inline script imported as string by esbuild loader
import script from "./scripts/toc.inline.ts";
import OverflowListFactory from "./OverflowList";
import { concatenateResources } from "../util/resources";

// Matches [K], [A], etc. — same regex as the heading-badges transformer. TOC entries are plain
// text (not HTML), so the AST-level badge transform never touches them; re-detect and re-render
// as JSX here instead. Kept as a duplicate on purpose (matches gpunkt.org's v4 behavior) rather
// than unified into a shared util — see gpunkt.org's upgrade.md for why.
const BADGE_RE = /(\[[A-ZÄÖÜ]\])/g;

function renderTocText(text: string) {
  const parts = text.split(BADGE_RE);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        /^\[[A-ZÄÖÜ]\]$/.test(part) ? (
          <span key={i} class="heading-badge">
            {part.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

interface Options {
  layout: "modern" | "legacy";
}

const defaultOptions: Options = {
  layout: "modern",
};

let numTocs = 0;
export default ((opts?: Partial<Options>) => {
  const layout = opts?.layout ?? defaultOptions.layout;
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory();
  const TableOfContents: QuartzComponent = (props: QuartzComponentProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { fileData, cfg } = props as any;
    if (!fileData?.toc) {
      return null;
    }

    const id = `toc-${numTocs++}`;
    return (
      <div class={classNames("toc")}>
        <button
          type="button"
          class={fileData.collapseToc ? "collapsed toc-header" : "toc-header"}
          aria-controls={id}
          aria-expanded={!fileData.collapseToc}
        >
          <h3>{i18n(cfg.locale).components.tableOfContents.title}</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <OverflowList
          id={id}
          class={fileData.collapseToc ? "collapsed toc-content" : "toc-content"}
        >
          {fileData.toc.map((tocEntry: Record<string, unknown>) => {
            const slug = String(tocEntry.slug);
            const depth = String(tocEntry.depth);
            const text = String(tocEntry.text);
            return (
              <li key={slug} class={`depth-${depth}`}>
                <a href={`#${slug}`} data-for={slug}>
                  {renderTocText(text)}
                </a>
              </li>
            );
          })}
        </OverflowList>
      </div>
    );
  };

  TableOfContents.css = modernStyle;
  TableOfContents.afterDOMLoaded = concatenateResources(
    script,
    overflowListAfterDOMLoaded,
  ) as string;

  const LegacyTableOfContents: QuartzComponent = (props: QuartzComponentProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { fileData, cfg } = props as any;
    if (!fileData?.toc) {
      return null;
    }
    return (
      <details class="toc" open={!fileData.collapseToc}>
        <summary>
          <h3>{i18n(cfg.locale).components.tableOfContents.title}</h3>
        </summary>
        <ul>
          {fileData.toc.map((tocEntry: Record<string, unknown>) => {
            const slug = String(tocEntry.slug);
            const depth = String(tocEntry.depth);
            const text = String(tocEntry.text);
            return (
              <li key={slug} class={`depth-${depth}`}>
                <a href={`#${slug}`} data-for={slug}>
                  {renderTocText(text)}
                </a>
              </li>
            );
          })}
        </ul>
      </details>
    );
  };
  LegacyTableOfContents.css = legacyStyle;

  return layout === "modern" ? TableOfContents : LegacyTableOfContents;
}) satisfies QuartzComponentConstructor<Partial<Options>>;
