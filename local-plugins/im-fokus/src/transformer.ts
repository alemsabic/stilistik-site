import type { QuartzTransformerPlugin } from "@quartz-community/types";
import { visit } from "unist-util-visit";
import type { Element, Text, Root, ElementContent } from "hast";

function containsFokus(node: Element): boolean {
  let found = false;
  visit(node, "text", (textNode: Text) => {
    if (textNode.value.includes("(im Fokus)")) found = true;
  });
  return found;
}

// Recursively walks children and splits "(im Fokus)" text into [text, span, text]
function transformFokusChildren(children: ElementContent[]): ElementContent[] {
  return children.flatMap((child) => {
    if (child.type === "text") {
      if (!(child as Text).value.includes("(im Fokus)")) return [child];
      const parts = (child as Text).value.split("(im Fokus)");
      const result: ElementContent[] = [];
      parts.forEach((part, i) => {
        if (part) result.push({ type: "text", value: part } as Text);
        if (i < parts.length - 1) {
          result.push({
            type: "element",
            tagName: "span",
            properties: { className: ["fokus-marker"] },
            children: [{ type: "text", value: "im Fokus" }],
          } as Element);
        }
      });
      return result;
    }
    if (child.type === "element") {
      return [
        {
          ...(child as Element),
          children: transformFokusChildren((child as Element).children),
        } as Element,
      ];
    }
    return [child];
  });
}

export const ImFokus: QuartzTransformerPlugin = () => {
  return {
    name: "ImFokus",
    htmlPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "element", (node: Element) => {
            if (node.tagName !== "li") return;
            if (!containsFokus(node)) return;

            const classes = (node.properties?.className as string[]) ?? [];
            node.properties = { ...node.properties, className: [...classes, "li-im-fokus"] };
            node.children = transformFokusChildren(node.children) as typeof node.children;
          });
        },
      ];
    },
  };
};
