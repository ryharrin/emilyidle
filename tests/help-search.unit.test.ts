import { describe, expect, it } from "vitest";

import { HELP_SECTION_IDS, HELP_SECTIONS } from "../src/ui/help/helpContent";
import { searchHelpSections } from "../src/ui/help/helpSearch";

describe("help search ranking", () => {
  it("prioritizes tier badge metadata", () => {
    const results = searchHelpSections(HELP_SECTIONS, "tier");
    expect(results[0]?.id).toBe(HELP_SECTION_IDS.tierBadges);
  });

  it("surfaces catalog shopping for catalog keywords", () => {
    const results = searchHelpSections(HELP_SECTIONS, "catalog");
    expect(results[0]?.id).toBe(HELP_SECTION_IDS.catalogShop);
  });

  it("returns nothing when no matches exist", () => {
    expect(searchHelpSections(HELP_SECTIONS, "bazaar")).toHaveLength(0);
  });
});
