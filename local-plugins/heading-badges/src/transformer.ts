import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { visit } from "unist-util-visit";
import type { Element, Text, Root, ElementContent } from "hast";

// Matches [K], [A], etc. in heading text nodes
export const BADGE_RE = /(\[[A-ZÄÖÜ]\])/g;

// Splits text on "|" and inserts <wbr> after each pipe for soft line breaks
function insertPipeBreaks(text: string): ElementContent[] {
  const parts = text.split("|");
  if (parts.length === 1) return [{ type: "text", value: text } as Text];

  const result: ElementContent[] = [];
  parts.forEach((part, i) => {
    if (i > 0) {
      result.push({ type: "text", value: "|" } as Text);
      result.push({ type: "element", tagName: "wbr", properties: {}, children: [] } as Element);
    }
    if (part) result.push({ type: "text", value: part } as Text);
  });
  return result;
}

export const HeadingBadges: QuartzTransformerPlugin = () => {
  return {
    name: "HeadingBadges",
    htmlPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "element", (node: Element) => {
            if (!["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) return;

            const newChildren: ElementContent[] = [];

            for (const child of node.children) {
              if (child.type !== "text") {
                newChildren.push(child);
                continue;
              }

              const parts = (child as Text).value.split(BADGE_RE);

              for (const part of parts) {
                if (part === "") continue;
                if (/^\[[A-ZÄÖÜ]\]$/.test(part)) {
                  newChildren.push({
                    type: "element",
                    tagName: "span",
                    properties: { className: ["heading-badge"] },
                    children: [{ type: "text", value: part.slice(1, -1) }],
                  } as Element);
                } else {
                  newChildren.push(...insertPipeBreaks(part));
                }
              }
            }

            node.children = newChildren;
          });
        },
      ];
    },
  };
};
