import remarkGfm from "remark-gfm";
import smartypants from "remark-smartypants";
import type { QuartzTransformerPlugin } from "@quartz-community/types";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { visit } from "unist-util-visit";

// Suppress the citation-tooltip popover on footnote-reference markers (<sup><a ...></sup>) —
// they aren't real internal links, so the popover-preview hover behavior doesn't apply.
function rehypeFootnoteRefNoPopover() {
  return (tree: any) => {
    visit(tree as any, (node: any, _index: any, parent: any) => {
      if (
        node.type === "element" &&
        node.tagName === "a" &&
        parent &&
        parent.tagName === "sup"
      ) {
        node.properties = { ...node.properties, "data-no-popover": true };
      }
    });
  };
}

export interface GfmOptions {
  enableSmartyPants: boolean;
  linkHeadings: boolean;
}

const defaultOptions: GfmOptions = {
  enableSmartyPants: true,
  linkHeadings: true,
};

export const GitHubFlavoredMarkdown: QuartzTransformerPlugin<Partial<GfmOptions>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "GitHubFlavoredMarkdown",
    markdownPlugins() {
      return opts.enableSmartyPants ? [remarkGfm, smartypants] : [remarkGfm];
    },
    htmlPlugins() {
      if (opts.linkHeadings) {
        return [
          rehypeFootnoteRefNoPopover,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                role: "anchor",
                ariaHidden: true,
                tabIndex: -1,
                "data-no-popover": true,
              },
              content: {
                type: "element",
                tagName: "svg",
                properties: {
                  width: 18,
                  height: 18,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                },
                children: [
                  {
                    type: "element",
                    tagName: "path",
                    properties: {
                      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
                    },
                    children: [],
                  },
                  {
                    type: "element",
                    tagName: "path",
                    properties: {
                      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
                    },
                    children: [],
                  },
                ],
              },
            },
          ],
        ];
      } else {
        return [rehypeFootnoteRefNoPopover];
      }
    },
  };
};
