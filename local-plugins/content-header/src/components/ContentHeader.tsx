import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
  QuartzPluginData,
  FullSlug,
} from "@quartz-community/types";
import { classNames } from "@quartz-community/utils";
import { resolveRelative } from "@quartz-community/utils/path";

// Ported from gpunkt.org's v4 ContentHeader.tsx. Date formatting is implemented inline here
// (rather than importing v5 core's quartz/components/Date.tsx) because this component now lives
// in its own separate package — it can no longer reach into quartz/components directly. This is a
// packaging necessity, not a design change: output is byte-identical to the core Date.tsx patch
// applied for gpunkt.org (DD.MM.YYYY, ignores locale).
function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function getDate(data: QuartzPluginData): Date | undefined {
  const dates = (data as { dates?: Record<string, Date> }).dates;
  const defaultDateType = (data as { defaultDateType?: string }).defaultDateType;
  if (!dates || !defaultDateType) return undefined;
  return dates[defaultDateType];
}

interface ContentHeaderOptions {
  /** Base URL for the GitHub repository */
  baseUrl: string;
  /** Whether to show tags in the header */
  showTags?: boolean;
}

const defaultOptions: ContentHeaderOptions = {
  baseUrl: "",
  showTags: false,
};

export default ((opts?: Partial<ContentHeaderOptions>) => {
  const options: ContentHeaderOptions = { ...defaultOptions, ...opts };

  const ContentHeader: QuartzComponent = ({
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    const text = fileData.text;
    const tags = fileData.frontmatter?.tags as string[] | undefined;

    // Check if ContentHeader should be hidden via frontmatter
    const showContentHeader = fileData.frontmatter?.showContentHeader !== false;

    // Get file path for edit link
    let filePath = fileData.filePath ?? "";
    if (filePath.startsWith("content/")) {
      filePath = filePath.substring("content/".length);
    }
    const githubUrl = `${options.baseUrl}/${filePath}`;

    // Only render if there's content and showContentHeader is not false
    if (!text || !showContentHeader) return null;

    // Get date
    const date = getDate(fileData);
    const dateText = date ? formatDate(date) : null;

    return (
      <div class={classNames(displayClass, "content-header")}>
        <dl>
          {dateText && (
            <>
              <dt>Stand:</dt>
              <dd>
                <time datetime={date!.toISOString()}>{dateText}</time>
              </dd>
            </>
          )}

          {options.showTags && tags && tags.length > 0 && (
            <>
              <dt>Schlagwörter:</dt>
              <dd class="tags-inline">
                {tags.map((tag, index) => {
                  const linkDest = resolveRelative(fileData.slug as FullSlug, `tags/${tag}` as FullSlug);
                  return (
                    <span key={tag}>
                      <a href={linkDest} class="internal tag-link">
                        {tag}
                      </a>
                      {index < tags.length - 1 && ", "}
                    </span>
                  );
                })}
              </dd>
            </>
          )}
        </dl>

        <a class="edit-link" href={githubUrl} target="_blank" rel="noopener noreferrer">
          Auf GitHub bearbeiten →
        </a>
      </div>
    );
  };

  ContentHeader.css = `
  .content-header {
    text-align: right;
    margin: 1rem 0 2.5rem 0;
    padding: 0.75rem 0;
    padding-right: 0;
  }

  .content-header dl {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--darkgray);
  }

  .content-header dt {
    display: inline;
    margin-right: 0.5rem;
    color: var(--dark);
    opacity: 0.5;
  }

  .content-header dd {
    display: inline;
    margin: 0;
  }

  .content-header dd::after {
    content: "";
    display: block;
    margin-bottom: 0.25rem;
  }

  .content-header .tags-inline {
    display: inline;
  }

  .content-header .tags-inline a.tag-link {
    color: var(--dark);
    font-size: 0.7rem;
  }

  .content-header a.edit-link {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--dark);
    opacity: 0.5;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .content-header a.edit-link:hover {
    opacity: 1;
    text-decoration: underline;
  }
  `;

  return ContentHeader;
}) satisfies QuartzComponentConstructor<Partial<ContentHeaderOptions>>;
