import type { HelpSection } from "./helpContent";

const normalize = (value: string) => value.trim().toLowerCase();

export function searchHelpSections(sections: HelpSection[], term: string): HelpSection[] {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) {
    return sections;
  }

  const scored = sections
    .map((section, index) => {
      const title = normalize(section.title);
      const keywords = section.keywords?.map(normalize) ?? [];
      const body = section.body.join(" ").toLowerCase();
      let score = 0;

      if (title === normalizedTerm) {
        score += 120;
      }

      if (keywords.some((keyword) => keyword === normalizedTerm)) {
        score += 110;
      }
      if (keywords.some((keyword) => keyword.includes(normalizedTerm))) {
        score += 90;
      }

      if (title.includes(normalizedTerm)) {
        score += 70;
      }

      if (body.includes(normalizedTerm)) {
        score += 50;
      }

      return { section, index, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((lhs, rhs) => {
      if (rhs.score !== lhs.score) {
        return rhs.score - lhs.score;
      }
      return lhs.index - rhs.index;
    });

  return scored.map((entry) => entry.section);
}
