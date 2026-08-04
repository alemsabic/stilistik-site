import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types";
import { classNames } from "@quartz-community/utils/lang";
import { ALPHABET, buildIndexEntries, groupByLetter } from "../util/entries";
import { resolveRelative } from "../util/path";

// "#" is a valid *visible* bucket label but not a valid CSS identifier character —
// querySelector-style APIs choke on `id="site-index-#"` (works today only because the SPA
// router uses getElementById, not querySelector). Anchors/ids use this DOM-safe id instead;
// only the rendered label stays "#".
function letterDomId(letter: string): string {
  return letter === "#" ? "site-index-num" : `site-index-${letter}`;
}

// Layout (columns, sticky jump-nav, letter-header size, width breakout) lives in
// quartz/styles/custom.scss, scoped to body[data-slug="index"] — same convention as
// Tagline (local-plugins/site-components): centralize site-wide styling in one place
// instead of shipping Component.css here.
export default (() => {
  const SiteIndex: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps & { displayClass?: string }) => {
    if (fileData.slug !== "index") return null;

    const entries = buildIndexEntries(allFiles as Parameters<typeof buildIndexEntries>[0]);
    const groups = groupByLetter(entries);
    const occupiedLetters = new Set(groups.map((g) => g.letter));
    const slug = fileData.slug as string;
    const jumpLetters = ["#", ...ALPHABET];

    return (
      <div class={classNames(displayClass, "site-index")}>
        <h3>Index</h3>
        <nav class="site-index-nav" aria-label="Alphabetische Sprungleiste">
          {jumpLetters.map((letter) =>
            occupiedLetters.has(letter) ? (
              <a href={`#${letterDomId(letter)}`}>{letter}</a>
            ) : (
              <span class="empty">{letter}</span>
            ),
          )}
        </nav>
        <div class="site-index-columns">
          {groups.map((group) => (
            <div class="site-index-group" id={letterDomId(group.letter)}>
              <h4 class="site-index-letter">{group.letter}</h4>
              <ul>
                {group.entries.map((entry) => (
                  <li>
                    <a class="internal" href={resolveRelative(slug, entry.slug)}>
                      {entry.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return SiteIndex;
}) satisfies QuartzComponentConstructor;
