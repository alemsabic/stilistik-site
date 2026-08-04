import type { QuartzPluginData } from "@quartz-community/types";
import { isFolderPath } from "@quartz-community/utils/path";

export interface SiteIndexEntry {
  slug: string;
  title: string;
}

export interface LetterGroup {
  letter: string;
  entries: SiteIndexEntry[];
}

export const ALPHABET: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function lastSlugSegment(slug: string): string {
  const segments = slug.split("/").filter((s) => s !== "" && s !== "index");
  return segments[segments.length - 1] ?? slug;
}

export function resolveDisplayTitle(page: {
  frontmatter?: Record<string, unknown>;
  slug?: string;
}): string {
  const frontmatter = page.frontmatter ?? {};
  const shortTitle = frontmatter.shortTitle as string | undefined;
  const title = frontmatter.title as string | undefined;
  const nonIndexTitle = title === "index" ? undefined : title;
  return shortTitle || nonIndexTitle || lastSlugSegment(page.slug ?? "");
}

const GERMAN_SORT_MAP: Record<string, string> = {
  ä: "a",
  ö: "o",
  ü: "u",
  ß: "ss",
};

export function sortKeyForTitle(title: string): string {
  const lowered = title.toLowerCase();
  const germanNormalized = lowered.replace(/[äöüß]/g, (ch) => GERMAN_SORT_MAP[ch] ?? ch);
  return germanNormalized.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function bucketLetter(title: string): string {
  const key = sortKeyForTitle(title);
  const first = key.charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

type IndexablePage = QuartzPluginData &
  Record<string, unknown> & {
    frontmatter?: Record<string, unknown>;
    slug?: string;
    unlisted?: unknown;
  };

export function buildIndexEntries(allFiles: IndexablePage[]): SiteIndexEntry[] {
  return allFiles
    .filter((p) => p.slug !== "index")
    .filter((p) => !isFolderPath(p.slug ?? ""))
    .filter((p) => p.unlisted !== true)
    .filter((p) => !(p.slug ?? "").startsWith("tags/"))
    .filter((p) => p.slug !== "404")
    .map((p) => ({
      slug: p.slug as string,
      title: resolveDisplayTitle(p),
    }))
    .sort((a, b) => {
      const keyA = sortKeyForTitle(a.title);
      const keyB = sortKeyForTitle(b.title);
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return a.title.localeCompare(b.title);
    });
}

export function groupByLetter(entries: SiteIndexEntry[]): LetterGroup[] {
  const groups = new Map<string, SiteIndexEntry[]>();
  for (const entry of entries) {
    const letter = bucketLetter(entry.title);
    const existing = groups.get(letter);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(letter, [entry]);
    }
  }
  const orderedLetters = ["#", ...ALPHABET];
  return orderedLetters
    .filter((letter) => groups.has(letter))
    .map((letter) => ({ letter, entries: groups.get(letter)! }));
}
