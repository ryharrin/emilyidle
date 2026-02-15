import type { CatalogTierId } from "./model/types";
import { getTierBadgeByCatalogTier, type TierBadgeDefinition } from "./tierBadges";

export type CatalogBrand =
  | "Rolex"
  | "Jaeger-LeCoultre"
  | "Audemars Piguet"
  | "Omega"
  | "Cartier"
  | "Seiko"
  | "Casio"
  | "Citizen"
  | "Grand Seiko"
  | "Longines"
  | "Breitling"
  | "TAG Heuer"
  | "Tissot"
  | "Bulova"
  | "Hamilton"
  | "Patek Philippe"
  | "A. Lange & Sohne"
  | "Nomos"
  | "Panerai"
  | "IWC"
  | "F.P. Journe"
  | "Breguet"
  | "Vacheron Constantin"
  | "Girard-Perregaux"
  | "Blancpain"
  | "Hublot";

export type CatalogImage = {
  url: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  author: string;
  attribution: string;
};

export type CatalogMovementSourceType = "primary" | "secondary";

export type CatalogWindingSystem =
  | "battery"
  | "self-winding"
  | "hand-wound"
  | "tourbillon-manual"
  | "tourbillon-automatic";

export type CatalogMovementDetails = {
  movementType: CatalogTierId;
  movementSourceType: CatalogMovementSourceType;
  movementSourceUrl: string;
  movementSourceLabel: string;
  caliberName: string;
  windingSystem: CatalogWindingSystem;
  frequencyBph: number | null;
  powerReserveHours: number | null;
  jewelCount: number | null;
  escapement: string | null;
  movementNotes: string | null;
  unknownReason: string | null;
};

export type CatalogSourceAuthority = "manufacturer" | "retailer" | "reference";

export type CatalogSourceReference = {
  label: string;
  url: string;
  authority: CatalogSourceAuthority;
};

export type CatalogTechnicalSpecification = {
  label: string;
  value: string;
};

export type CatalogMarketPriceEntry = {
  label: string;
  amountUsd: number;
  sourceLabel: string;
  sourceUrl: string;
  observedAt: string;
};

export type CatalogDetails = {
  fullDescription: string;
  featureHighlights: string[];
  technicalSpecifications: CatalogTechnicalSpecification[];
  marketPricesUsd: CatalogMarketPriceEntry[];
  sourceReferences: CatalogSourceReference[];
  auditTimestamp: string;
};

export type CatalogEntryBase = {
  id: string;
  brand: CatalogBrand;
  model: string;
  description: string;
  year: string;
  tags: string[];
  facts?: string[];
  image: CatalogImage;
};

export type CatalogEntry = CatalogEntryBase & CatalogMovementDetails & { details: CatalogDetails };

const CATALOG_ENTRIES_BASE: CatalogEntryBase[] = [
  {
    id: "rolex-calibrorolex",
    brand: "Rolex",
    model: "Calibrorolex",
    description: "Open-license reference image of Rolex Calibrorolex.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Calibrorolex.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Calibrorolex.jpg",
      licenseName: "Public domain",
      licenseUrl: "",
      author: "Piero7",
      attribution: "File:Calibrorolex.jpg by Piero7 (Public domain)",
    },
  },
  {
    id: "rolex-quadrante-tropical-di-rolex-gmt-master-ref-1675-long-e",
    brand: "Rolex",
    model: "Quadrante tropical di Rolex GMT-Master ref. 1675 Long E",
    description:
      "Open-license reference image of Rolex Quadrante tropical di Rolex GMT-Master ref. 1675 Long E.",
    year: "Unknown",
    tags: ["gmt", "rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/13/Quadrante_tropical_di_Rolex_GMT-Master_ref._1675_Long_E.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Quadrante_tropical_di_Rolex_GMT-Master_ref._1675_Long_E.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Quadrante tropical di Rolex GMT-Master ref. 1675 Long E.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-gmt-master-ii-ref-126713grnr",
    brand: "Rolex",
    model: "Rolex GMT-Master II ref. 126713GRNR",
    description: "Open-license reference image of Rolex Rolex GMT-Master II ref. 126713GRNR.",
    year: "Unknown",
    tags: ["gmt", "rolex", "watch"],
    facts: [
      "The GMT-Master line is built around tracking multiple time zones via a 24-hour bezel.",
      "Two-tone cases and rotating 24-hour bezels are signature GMT cues.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Rolex_GMT-Master_II_ref._126713GRNR.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_GMT-Master_II_ref._126713GRNR.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution: "File:Rolex GMT-Master II ref. 126713GRNR.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-gmt-master-ref-16700",
    brand: "Rolex",
    model: "Rolex GMT-Master ref. 16700",
    description: "Open-license reference image of Rolex Rolex GMT-Master ref. 16700.",
    year: "Unknown",
    tags: ["gmt", "rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Rolex_GMT-Master_ref._16700.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_GMT-Master_ref._16700.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution: "File:Rolex GMT-Master ref. 16700.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-daytona-ref-6265-in-oro-primi-anni-settanta",
    brand: "Rolex",
    model: "Rolex Daytona ref. 6265 in oro, primi anni Settanta",
    description:
      "Open-license reference image of Rolex Rolex Daytona ref. 6265 in oro, primi anni Settanta.",
    year: "Unknown",
    tags: ["daytona", "rolex", "watch"],
    facts: [
      "The Daytona is Rolex's best-known manual line, tied closely to motorsport timing.",
      "Screw-down pushers and tachymeter bezels are hallmark Daytona details.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/04/Rolex_Daytona_ref._6265_in_oro%2C_primi_anni_Settanta.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Rolex_Daytona_ref._6265_in_oro,_primi_anni_Settanta.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Rolex Daytona ref. 6265 in oro, primi anni Settanta.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-the-real-thing-22119277278",
    brand: "Rolex",
    model: "The Real Thing (22119277278)",
    description: "Open-license reference image of Rolex The Real Thing (22119277278).",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/The_Real_Thing_%2822119277278%29.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Real_Thing_(22119277278).jpg",
      licenseName: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0",
      author: "Daniel Zimmermann from Bayern, Deutschland (Germany)",
      attribution:
        "File:The Real Thing (22119277278).jpg by Daniel Zimmermann from Bayern, Deutschland (Germany) (CC BY 2.0)",
    },
  },
  {
    id: "rolex-rolex-oyster-perpetual-ref-277200-con-quadrante-color-lavanda",
    brand: "Rolex",
    model: "Rolex Oyster Perpetual ref. 277200 con quadrante color lavanda",
    description:
      "Open-license reference image of Rolex Rolex Oyster Perpetual ref. 277200 con quadrante color lavanda.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Rolex_Oyster_Perpetual_ref._277200_con_quadrante_color_lavanda.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Rolex_Oyster_Perpetual_ref._277200_con_quadrante_color_lavanda.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Rolex Oyster Perpetual ref. 277200 con quadrante color lavanda.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-oyster-perpetual-con-quadrante-celebration",
    brand: "Rolex",
    model: "Rolex Oyster Perpetual con quadrante Celebration",
    description:
      "Open-license reference image of Rolex Rolex Oyster Perpetual con quadrante Celebration.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Rolex_Oyster_Perpetual_con_quadrante_Celebration.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Rolex_Oyster_Perpetual_con_quadrante_Celebration.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Rolex Oyster Perpetual con quadrante Celebration.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-particolare-di-un-exclamation-point-dial-su-un-rolex-gmt-master-ref-1675-la-ghiera-sbiadita-detta-anche-faded-o-ghost",
    brand: "Rolex",
    model:
      "Particolare di un Exclamation point dial su un Rolex GMT-Master ref. 1675. La ghiera sbiadita è detta anche faded o ghost.",
    description:
      "Open-license reference image of Rolex Particolare di un Exclamation point dial su un Rolex GMT-Master ref. 1675. La ghiera sbiadita è detta anche faded o ghost..",
    year: "Unknown",
    tags: ["gmt", "rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/17/Particolare_di_un_Exclamation_point_dial_su_un_Rolex_GMT-Master_ref._1675._La_ghiera_sbiadita_%C3%A8_detta_anche_faded_o_ghost..jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Particolare_di_un_Exclamation_point_dial_su_un_Rolex_GMT-Master_ref._1675._La_ghiera_sbiadita_%C3%A8_detta_anche_faded_o_ghost..jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Particolare di un Exclamation point dial su un Rolex GMT-Master ref. 1675. La ghiera sbiadita è detta anche faded o ghost..jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-macro-photography-of-a-rolex-watch",
    brand: "Rolex",
    model: "Macro photography of a Rolex watch",
    description: "Open-license reference image of Rolex Macro photography of a Rolex watch.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Macro_photography_of_a_Rolex_watch.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Macro_photography_of_a_Rolex_watch.jpg",
      licenseName: "CC BY 2.1 jp",
      licenseUrl: "https://creativecommons.org/licenses/by/2.1/jp/deed.en",
      author: "thnchiba",
      attribution: "File:Macro photography of a Rolex watch.jpg by thnchiba (CC BY 2.1 jp)",
    },
  },
  {
    id: "rolex-rolex-oyster-perpetual-ref-116000-con-quadrante-explorer",
    brand: "Rolex",
    model: "Rolex Oyster Perpetual ref. 116000 con quadrante Explorer",
    description:
      "Open-license reference image of Rolex Rolex Oyster Perpetual ref. 116000 con quadrante Explorer.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Rolex_Oyster_Perpetual_ref._116000_con_quadrante_Explorer.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Rolex_Oyster_Perpetual_ref._116000_con_quadrante_Explorer.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Rolex Oyster Perpetual ref. 116000 con quadrante Explorer.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-gmt-master-ii-ref-16710t",
    brand: "Rolex",
    model: "Rolex GMT Master II ref. 16710T",
    description: "Open-license reference image of Rolex Rolex GMT Master II ref. 16710T.",
    year: "Unknown",
    tags: ["gmt", "rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/27/Rolex_GMT_Master_II_ref._16710T.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_GMT_Master_II_ref._16710T.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution: "File:Rolex GMT Master II ref. 16710T.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-pocket-watch-in-box",
    brand: "Rolex",
    model: "Rolex pocket watch in box",
    description: "Open-license reference image of Rolex Rolex pocket watch in box.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Rolex_pocket_watch_in_box.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_pocket_watch_in_box.jpg",
      licenseName: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      author: "contri from Yonezawa-Shi, Yamagata, Japan",
      attribution:
        "File:Rolex pocket watch in box.jpg by contri from Yonezawa-Shi, Yamagata, Japan (CC BY-SA 2.0)",
    },
  },
  {
    id: "rolex-rolex-datejust-ref-16220-tapestry-dial",
    brand: "Rolex",
    model: "Rolex Datejust ref. 16220 tapestry dial",
    description: "Open-license reference image of Rolex Rolex Datejust ref. 16220 tapestry dial.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Rolex_Datejust_ref._16220_tapestry_dial.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Rolex_Datejust_ref._16220_tapestry_dial.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution: "File:Rolex Datejust ref. 16220 tapestry dial.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-watches-helsinki2",
    brand: "Rolex",
    model: "Rolex-watches-Helsinki2",
    description: "Open-license reference image of Rolex Rolex-watches-Helsinki2.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Rolex-watches-Helsinki2.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex-watches-Helsinki2.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Arto Alanenpää",
      attribution: "File:Rolex-watches-Helsinki2.jpg by Arto Alanenpää (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-montre-laroche-posay-water-resistant-rolex-submariner",
    brand: "Rolex",
    model: "Montre Laroche-Posay Water resistant ; Rolex submariner",
    description:
      "Open-license reference image of Rolex Montre Laroche-Posay Water resistant ; Rolex submariner.",
    year: "Unknown",
    tags: ["rolex", "submariner", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Montre_Laroche-Posay_Water_resistant_%3B_Rolex_submariner.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Montre_Laroche-Posay_Water_resistant_;_Rolex_submariner.jpg",
      licenseName: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Mathious Ier",
      attribution:
        "File:Montre Laroche-Posay Water resistant ; Rolex submariner.jpg by Mathious Ier (CC0)",
    },
  },
  {
    id: "rolex-rolex-day-date-lacquered-stella-dial",
    brand: "Rolex",
    model: "Rolex Day-Date Lacquered Stella Dial",
    description: "Open-license reference image of Rolex Rolex Day-Date Lacquered Stella Dial.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Rolex_Day-Date_Lacquered_Stella_Dial.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_Day-Date_Lacquered_Stella_Dial.jpg",
      licenseName: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Kevin Sweeney",
      attribution: "File:Rolex Day-Date Lacquered Stella Dial.jpg by Kevin Sweeney (CC0)",
    },
  },
  {
    id: "rolex-watch-la-roche-posay",
    brand: "Rolex",
    model: "Watch La Roche-Posay",
    description: "Open-license reference image of Rolex Watch La Roche-Posay.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Watch_La_Roche-Posay.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Watch_La_Roche-Posay.jpg",
      licenseName: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Mathious Ier",
      attribution: "File:Watch La Roche-Posay.jpg by Mathious Ier (CC0)",
    },
  },
  {
    id: "rolex-rolex-datejust-ref-16013-seconda-met-anni-70-primi-80",
    brand: "Rolex",
    model: "Rolex Datejust ref. 16013, seconda metà anni '70-primi '80",
    description:
      "Open-license reference image of Rolex Rolex Datejust ref. 16013, seconda metà anni '70-primi '80.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Rolex_Datejust_ref._16013%2C_seconda_met%C3%A0_anni_%2770-primi_%2780.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Rolex_Datejust_ref._16013,_seconda_met%C3%A0_anni_%2770-primi_%2780.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Rolex Datejust ref. 16013, seconda metà anni '70-primi '80.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-women-watch",
    brand: "Rolex",
    model: "Rolex.women watch",
    description: "Open-license reference image of Rolex Rolex.women watch.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/04/Rolex.women_watch.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex.women_watch.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Aashika vayila",
      attribution: "File:Rolex.women watch.jpg by Aashika vayila (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-ultimate-in-rose-gold-wristwatches-rcwatches",
    brand: "Rolex",
    model: "Ultimate in Rose Gold Wristwatches RCWATCHES",
    description:
      "Open-license reference image of Rolex Ultimate in Rose Gold Wristwatches RCWATCHES.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/94/Ultimate_in_Rose_Gold_Wristwatches_RCWATCHES.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Ultimate_in_Rose_Gold_Wristwatches_RCWATCHES.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Rcwatches",
      attribution:
        "File:Ultimate in Rose Gold Wristwatches RCWATCHES.jpg by Rcwatches (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-rolex-perrelet-perrolex",
    brand: "Rolex",
    model: "Rolex+Perrelet = Perrolex",
    description: "Open-license reference image of Rolex Rolex+Perrelet = Perrolex.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Rolex%2BPerrelet_%3D_Perrolex.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex%2BPerrelet_%3D_Perrolex.jpg",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Espenegger",
      attribution: "File:Rolex+Perrelet = Perrolex.jpg by Espenegger (CC BY-SA 3.0)",
    },
  },
  {
    id: "rolex-rolex-watch-ladies-datejust-1987",
    brand: "Rolex",
    model: "Rolex watch ladies Datejust 1987",
    description: "Open-license reference image of Rolex Rolex watch ladies Datejust 1987.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Rolex_watch_ladies_Datejust_1987.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_watch_ladies_Datejust_1987.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Jonathan Mauer",
      attribution: "File:Rolex watch ladies Datejust 1987.jpg by Jonathan Mauer (CC BY-SA 4.0)",
    },
  },
  {
    id: "rolex-milgaussnew",
    brand: "Rolex",
    model: "Milgaussnew",
    description: "Open-license reference image of Rolex Milgaussnew.",
    year: "Unknown",
    tags: ["rolex", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Milgaussnew.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Milgaussnew.jpg",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Defiancekofb (talk)",
      attribution: "File:Milgaussnew.jpg by Defiancekofb (talk) (CC BY-SA 3.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-reverso-2011",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre Reverso 2011",
    description: "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre Reverso 2011.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "reverso", "watch"],
    facts: [
      "The Reverso's swiveling case was designed to protect the dial during polo matches.",
      "Its Art Deco geometry and reversible case are the line's calling card.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Jaeger-LeCoultre_Reverso_2011.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Reverso_2011.jpg",
      licenseName: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      author: "Provo rossi",
      attribution: "File:Jaeger-LeCoultre Reverso 2011.jpg by Provo rossi (CC BY 4.0)",
    },
  },
  {
    id: "jaeger-lecoultre-balance-of-a-wristwatch-jaeger-lecoultre-master-eight-days-perpetual-squelette",
    brand: "Jaeger-LeCoultre",
    model: "Balance of a wristwatch Jaeger-LeCoultre Master Eight Days Perpetual Squelette",
    description:
      "Open-license reference image of Jaeger-LeCoultre Balance of a wristwatch Jaeger-LeCoultre Master Eight Days Perpetual Squelette.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Balance_of_a_wristwatch_Jaeger-LeCoultre_Master_Eight_Days_Perpetual_Squelette.png",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Balance_of_a_wristwatch_Jaeger-LeCoultre_Master_Eight_Days_Perpetual_Squelette.png",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author:
        "Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg: Ghilt derivative work: PawełMM (talk)",
      attribution:
        "File:Balance of a wristwatch Jaeger-LeCoultre Master Eight Days Perpetual Squelette.png by Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg: Ghilt derivative work: PawełMM (talk) (CC BY-SA 3.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-memovox-model-e855-with-calibre-k825-2",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre Memovox model E855 with calibre K825 (2)",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre Memovox model E855 with calibre K825 (2).",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Jaeger-LeCoultre_Memovox_model_E855_with_calibre_K825_%282%29.JPG",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Memovox_model_E855_with_calibre_K825_(2).JPG",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Ghilt",
      attribution:
        "File:Jaeger-LeCoultre Memovox model E855 with calibre K825 (2).JPG by Ghilt (CC BY-SA 3.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-reverso",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre-Reverso",
    description: "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre-Reverso.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "reverso", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/7/70/Jaeger-LeCoultre-Reverso.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre-Reverso.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Tiberido",
      attribution: "File:Jaeger-LeCoultre-Reverso.jpg by Tiberido (CC BY-SA 4.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-mastereightdaysperpetualsquelette-cropped-twice",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre MasterEightDaysPerpetualSquelette (cropped twice)",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre MasterEightDaysPerpetualSquelette (cropped twice).",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_%28cropped_twice%29.png",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_(cropped_twice).png",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author:
        "Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg: Ghilt derivative work: PawełMM (talk)",
      attribution:
        "File:Jaeger-LeCoultre MasterEightDaysPerpetualSquelette (cropped twice).png by Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg: Ghilt derivative work: PawełMM (talk) (CC BY-SA 3.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-img-0991",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-Lecoultre img 0991",
    description: "Open-license reference image of Jaeger-LeCoultre Jaeger-Lecoultre img 0991.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Jaeger-Lecoultre_img_0991.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-Lecoultre_img_0991.jpg",
      licenseName: "CC BY-SA 2.0 fr",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/fr/deed.en",
      author: "Rama",
      attribution: "File:Jaeger-Lecoultre img 0991.jpg by Rama (CC BY-SA 2.0 fr)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-e502-futurematic",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre E502 Futurematic",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre E502 Futurematic.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/8/81/Jaeger-LeCoultre_E502_Futurematic.JPG",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_E502_Futurematic.JPG",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Ghilt",
      attribution: "File:Jaeger-LeCoultre E502 Futurematic.JPG by Ghilt (CC BY-SA 4.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-memovox-model-e855-with-calibre-k825",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre Memovox model E855 with calibre K825",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre Memovox model E855 with calibre K825.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/58/Jaeger-LeCoultre_Memovox_model_E855_with_calibre_K825.JPG",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Memovox_model_E855_with_calibre_K825.JPG",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Ghilt",
      attribution:
        "File:Jaeger-LeCoultre Memovox model E855 with calibre K825.JPG by Ghilt (CC BY-SA 3.0)",
    },
  },
  {
    id: "jaeger-lecoultre-detailed-view-on-balance-and-rotor-of-jaeger-lecoultre-watch",
    brand: "Jaeger-LeCoultre",
    model: "Detailed view on balance and rotor of Jaeger-LeCoultre watch",
    description:
      "Open-license reference image of Jaeger-LeCoultre Detailed view on balance and rotor of Jaeger-LeCoultre watch.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Detailed_view_on_balance_and_rotor_of_Jaeger-LeCoultre_watch.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Detailed_view_on_balance_and_rotor_of_Jaeger-LeCoultre_watch.jpg",
      licenseName: "CC BY-SA 2.0 fr",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/fr/deed.en",
      author: "Rama",
      attribution:
        "File:Detailed view on balance and rotor of Jaeger-LeCoultre watch.jpg by Rama (CC BY-SA 2.0 fr)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-men-s-dress-watch-ca-1950s",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre men's dress watch ca. 1950s",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre men's dress watch ca. 1950s.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Jaeger-LeCoultre_men%27s_dress_watch_ca._1950s.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_men%27s_dress_watch_ca._1950s.jpg",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Kjetil Ree",
      attribution:
        "File:Jaeger-LeCoultre men's dress watch ca. 1950s.jpg by Kjetil Ree (CC BY-SA 3.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-mastereightdaysperpetualsquelette-cropped",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre MasterEightDaysPerpetualSquelette cropped",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre MasterEightDaysPerpetualSquelette cropped.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/28/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_cropped.png",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_cropped.png",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author:
        "Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg: Ghilt derivative work: PawełMM (talk)",
      attribution:
        "File:Jaeger-LeCoultre MasterEightDaysPerpetualSquelette cropped.png by Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg: Ghilt derivative work: PawełMM (talk) (CC BY-SA 3.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-caliber-k916-with-eu-version-rotor",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre caliber K916 with EU version rotor",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre caliber K916 with EU version rotor.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/25/Jaeger-LeCoultre_caliber_K916_with_EU_version_rotor.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_caliber_K916_with_EU_version_rotor.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Ghilt",
      attribution:
        "File:Jaeger-LeCoultre caliber K916 with EU version rotor.jpg by Ghilt (CC BY-SA 4.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-reverso-anni-2000",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre Reverso, anni 2000",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre Reverso, anni 2000.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "reverso", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Jaeger-LeCoultre_Reverso%2C_anni_2000.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Reverso,_anni_2000.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Clyde94",
      attribution: "File:Jaeger-LeCoultre Reverso, anni 2000.jpg by Clyde94 (CC BY-SA 4.0)",
    },
  },
  {
    id: "jaeger-lecoultre-jaeger-lecoultre-mastereightdaysperpetualsquelette",
    brand: "Jaeger-LeCoultre",
    model: "Jaeger-LeCoultre MasterEightDaysPerpetualSquelette",
    description:
      "Open-license reference image of Jaeger-LeCoultre Jaeger-LeCoultre MasterEightDaysPerpetualSquelette.",
    year: "Unknown",
    tags: ["jaeger-lecoultre", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Ghilt",
      attribution:
        "File:Jaeger-LeCoultre MasterEightDaysPerpetualSquelette.jpg by Ghilt (CC BY-SA 3.0)",
    },
  },
  {
    id: "audemars-piguet-quanti-me",
    brand: "Audemars Piguet",
    model: "Quantième",
    description: "Open-license reference image of Audemars Piguet Quantième.",
    year: "Unknown",
    tags: ["audemars piguet", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Quanti%C3%A8me.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Quanti%C3%A8me.jpg",
      licenseName: "CC0",
      licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "jcw",
      attribution: "File:Quantième.jpg by jcw (CC0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-ref-25831-con-datario-riserva-di-carica-e-tourbillon-risalente-al-1997",
    brand: "Audemars Piguet",
    model:
      "Audemars Piguet ref. 25831 con datario, riserva di carica e tourbillon, risalente al 1997",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet ref. 25831 con datario, riserva di carica e tourbillon, risalente al 1997.",
    year: "Unknown",
    tags: ["audemars piguet", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Audemars_Piguet_ref._25831_con_datario%2C_riserva_di_carica_e_tourbillon%2C_risalente_al_1997.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_ref._25831_con_datario,_riserva_di_carica_e_tourbillon,_risalente_al_1997.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Audemars Piguet ref. 25831 con datario, riserva di carica e tourbillon, risalente al 1997.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-dress-watch-in-oro-carica-manuale-fine-anni-70",
    brand: "Audemars Piguet",
    model: "Audemars Piguet dress watch in oro carica manuale, fine anni '70",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet dress watch in oro carica manuale, fine anni '70.",
    year: "Unknown",
    tags: ["audemars piguet", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Audemars_Piguet_dress_watch_in_oro_carica_manuale%2C_fine_anni_%2770.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_dress_watch_in_oro_carica_manuale,_fine_anni_%2770.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Audemars Piguet dress watch in oro carica manuale, fine anni '70.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-royal-oak-ref-15202",
    brand: "Audemars Piguet",
    model: "Audemars Piguet Royal Oak ref. 15202",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet Royal Oak ref. 15202.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    facts: [
      "The Royal Oak popularized the luxury steel sports watch with an exposed bezel screw motif.",
      "Its angular case and integrated bracelet define the Royal Oak profile.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Audemars_Piguet_Royal_Oak_ref._15202.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_ref._15202.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "OpaleHorse",
      attribution: "File:Audemars Piguet Royal Oak ref. 15202.jpg by OpaleHorse (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-royal-oak-cronograph-con-calibro-modulare-ref-25721-primi-anni-novanta",
    brand: "Audemars Piguet",
    model:
      "Audemars Piguet Royal Oak Cronograph con calibro modulare, ref. 25721. Primi anni Novanta",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet Royal Oak Cronograph con calibro modulare, ref. 25721. Primi anni Novanta.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/6/68/Audemars_Piguet_Royal_Oak_Cronograph_con_calibro_modulare%2C_ref._25721._Primi_anni_Novanta.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_Cronograph_con_calibro_modulare,_ref._25721._Primi_anni_Novanta.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Audemars Piguet Royal Oak Cronograph con calibro modulare, ref. 25721. Primi anni Novanta.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-royal-oak-in-oro-con-calendario-perpetuo-met-anni-novanta",
    brand: "Audemars Piguet",
    model: "Audemars Piguet Royal Oak in oro con calendario perpetuo, metà anni Novanta",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet Royal Oak in oro con calendario perpetuo, metà anni Novanta.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo%2C_met%C3%A0_anni_Novanta.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo,_met%C3%A0_anni_Novanta.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Clyde94",
      attribution:
        "File:Audemars Piguet Royal Oak in oro con calendario perpetuo, metà anni Novanta.jpg by Clyde94 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-2385",
    brand: "Audemars Piguet",
    model: "Audemars 2385",
    description: "Open-license reference image of Audemars Piguet Audemars 2385.",
    year: "Unknown",
    tags: ["audemars piguet", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Audemars_2385.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Audemars_2385.jpg",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Magnus26",
      attribution: "File:Audemars 2385.jpg by Magnus26 (CC BY-SA 3.0)",
    },
  },
  {
    id: "audemars-piguet-royal-oak-automatic",
    brand: "Audemars Piguet",
    model: "Royal Oak Automatic",
    description: "Open-license reference image of Audemars Piguet Royal Oak Automatic.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Royal_Oak_Automatic_.png",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Royal_Oak_Automatic_.png",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Bugattiben48",
      attribution: "File:Royal Oak Automatic .png by Bugattiben48 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-calibro-audemars-piguet-7121-con-massa-oscillante-personalizzata-con-il-numero-50-per-celebrare-i-cinquant-anni-dalla-nascita-del-royal-oak-risalente-al-2022",
    brand: "Audemars Piguet",
    model:
      "Calibro Audemars Piguet 7121 con massa oscillante personalizzata con il numero 50, per celebrare i cinquant'anni dalla nascita del Royal Oak. Risalente al 2022",
    description:
      "Open-license reference image of Audemars Piguet Calibro Audemars Piguet 7121 con massa oscillante personalizzata con il numero 50, per celebrare i cinquant'anni dalla nascita del Royal Oak. Risalente al 2022.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/7/79/Calibro_Audemars_Piguet_7121_con_massa_oscillante_personalizzata_con_il_numero_50%2C_per_celebrare_i_cinquant%27anni_dalla_nascita_del_Royal_Oak._Risalente_al_2022.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Calibro_Audemars_Piguet_7121_con_massa_oscillante_personalizzata_con_il_numero_50,_per_celebrare_i_cinquant%27anni_dalla_nascita_del_Royal_Oak._Risalente_al_2022.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Calibro Audemars Piguet 7121 con massa oscillante personalizzata con il numero 50, per celebrare i cinquant'anni dalla nascita del Royal Oak. Risalente al 2022.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-2385-royal-oak-resized",
    brand: "Audemars Piguet",
    model: "Audemars 2385 Royal Oak resized",
    description: "Open-license reference image of Audemars Piguet Audemars 2385 Royal Oak resized.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Audemars_2385_Royal_Oak_resized.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Audemars_2385_Royal_Oak_resized.jpg",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Magnus26",
      attribution: "File:Audemars 2385 Royal Oak resized.jpg by Magnus26 (CC BY-SA 3.0)",
    },
  },
  {
    id: "audemars-piguet-ultimate-in-rose-gold-wristwatches-rcwatches",
    brand: "Audemars Piguet",
    model: "Ultimate in Rose Gold Wristwatches RCWATCHES",
    description:
      "Open-license reference image of Audemars Piguet Ultimate in Rose Gold Wristwatches RCWATCHES.",
    year: "Unknown",
    tags: ["audemars piguet", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/94/Ultimate_in_Rose_Gold_Wristwatches_RCWATCHES.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Ultimate_in_Rose_Gold_Wristwatches_RCWATCHES.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Rcwatches",
      attribution:
        "File:Ultimate in Rose Gold Wristwatches RCWATCHES.jpg by Rcwatches (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-code-11-59-manual-ref-26393",
    brand: "Audemars Piguet",
    model: "Audemars Piguet CODE 11.59 Chronograph ref. 26393",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet CODE 11.59 Chronograph ref. 26393.",
    year: "Unknown",
    tags: ["audemars piguet", "manual", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Audemars_Piguet_CODE_11.59_Chronograph_ref._26393.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_CODE_11.59_Chronograph_ref._26393.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Audemars Piguet CODE 11.59 Chronograph ref. 26393.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-royal-oak-offshore-diver",
    brand: "Audemars Piguet",
    model: "Audemars Piguet Royal Oak Offshore Diver",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet Royal Oak Offshore Diver.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Audemars_Piguet_Royal_Oak_Offshore_Diver.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_Offshore_Diver.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Clyde94",
      attribution: "File:Audemars Piguet Royal Oak Offshore Diver.jpg by Clyde94 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-royal-oak-in-oro-e-tantalio-fine-anni-80-primi-90",
    brand: "Audemars Piguet",
    model: "Audemars Piguet Royal Oak in oro e tantalio, fine anni '80-primi '90",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet Royal Oak in oro e tantalio, fine anni '80-primi '90.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Audemars_Piguet_Royal_Oak_in_oro_e_tantalio%2C_fine_anni_%2780-primi_%2790.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_in_oro_e_tantalio,_fine_anni_%2780-primi_%2790.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Clyde94",
      attribution:
        "File:Audemars Piguet Royal Oak in oro e tantalio, fine anni '80-primi '90.jpg by Clyde94 (CC BY-SA 4.0)",
    },
  },
  {
    id: "audemars-piguet-audemars-piguet-royal-oak-tradition-d-excellence-4-ref-25969-risalente-al-2004",
    brand: "Audemars Piguet",
    model: "Audemars Piguet Royal Oak Tradition d'Excellence 4, ref. 25969, risalente al 2004",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet Royal Oak Tradition d'Excellence 4, ref. 25969, risalente al 2004.",
    year: "Unknown",
    tags: ["audemars piguet", "royal-oak", "watch"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Audemars_Piguet_Royal_Oak_Tradition_d%27Excellence_4%2C_ref._25969%2C_risalente_al_2004.jpg",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_Tradition_d%27Excellence_4,_ref._25969,_risalente_al_2004.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution:
        "File:Audemars Piguet Royal Oak Tradition d'Excellence 4, ref. 25969, risalente al 2004.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "omega-omega-seamaster-de-ville-1970",
    brand: "Omega",
    model: "Omega Seamaster De Ville",
    description: "Open-license reference image of Omega Seamaster De Ville.",
    year: "1970",
    tags: ["omega", "seamaster", "watch", "womens"],
    facts: [
      "Omega introduced the Seamaster line in the late 1940s.",
      "De Ville originally appeared as a Seamaster sub-collection before becoming its own line.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Omega_Seamaster_De_Ville_1970.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Omega_Seamaster_De_Ville_1970.jpg",
      licenseName: "Public domain",
      licenseUrl: "",
      author: "Fourdee",
      attribution: "File:Omega Seamaster De Ville 1970.jpg by Fourdee (Public domain)",
    },
  },
  {
    id: "omega-omega-seamaster-120m-1998",
    brand: "Omega",
    model: "Omega Seamaster 120M Analog-Digital",
    description: "Open-license reference image of Omega Seamaster 120M Analog-Digital.",
    year: "1998",
    tags: ["omega", "seamaster", "watch", "diver"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Omega_seamaster_120m_1998.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Omega_seamaster_120m_1998.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "AbdullahAlfowzan",
      attribution: "File:Omega seamaster 120m 1998.jpg by AbdullahAlfowzan (CC BY-SA 4.0)",
    },
  },
  {
    id: "omega-omega-speedmaster-reduced-351050",
    brand: "Omega",
    model: "Omega Speedmaster Reduced 3510.50",
    description: "Open-license reference image of Omega Speedmaster Reduced 3510.50.",
    year: "Unknown",
    tags: ["omega", "speedmaster", "watch", "manual"],
    facts: [
      "The Speedmaster is Omega's best-known manual family, linked to spaceflight heritage.",
      "The 'Reduced' variant is a smaller, more compact take on automatic Speedmaster proportions.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/06/Omega_speedmaster_reduced_351050.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Omega_speedmaster_reduced_351050.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "Kjellnz",
      attribution: "File:Omega speedmaster reduced 351050.jpg by Kjellnz (CC BY-SA 4.0)",
    },
  },
  {
    id: "cartier-cartier-tank",
    brand: "Cartier",
    model: "Cartier Tank",
    description: "Open-license reference image of Cartier Tank.",
    year: "Unknown",
    tags: ["cartier", "tank", "watch", "dress", "womens"],
    facts: [
      "The Tank debuted in 1917 and became one of Cartier's signature designs.",
      "The rectangular case and railroad minute track are automatic Tank cues.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Cartier_Tank.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Cartier_Tank.jpg",
      licenseName: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
      author: "Guy Sie",
      attribution: "File:Cartier Tank.jpg by Guy Sie (CC BY-SA 2.0)",
    },
  },
  {
    id: "cartier-cartier-tank-must-2021",
    brand: "Cartier",
    model: "Cartier Tank Must",
    description: "Open-license reference image of Cartier Tank Must.",
    year: "2021",
    tags: ["cartier", "tank", "watch", "dress", "womens"],
    facts: [
      "The Tank Must is a modern re-issue inspired by earlier Tank Must models.",
      "A clean dial and compact proportions make it a staple dress watch silhouette.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Cartier_Tank_Must%2C_2021.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Cartier_Tank_Must,_2021.jpg",
      licenseName: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      author: "EMore98",
      attribution: "File:Cartier Tank Must, 2021.jpg by EMore98 (CC BY-SA 4.0)",
    },
  },
  {
    id: "cartier-cartier-santos-1988",
    brand: "Cartier",
    model: "Cartier Santos",
    description: "Open-license reference image of Cartier Santos.",
    year: "1988",
    tags: ["cartier", "santos", "watch", "womens"],
    facts: [
      "The Santos is one of the earliest purpose-built wristwatch designs, originating in the early 1900s.",
      "Signature details include the square bezel and exposed screws.",
    ],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/9/99/Cartier_Santos_1988.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Cartier_Santos_1988.jpg",
      licenseName: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      author: "Noop1958",
      attribution: "File:Cartier Santos 1988.jpg by Noop1958 (CC BY-SA 3.0)",
    },
  },

  // Phase 46 cream-of-the-tier additions: new low/mid/lux discoveries with full metadata.
  {
    id: "omega-aurora-frost",
    brand: "Omega",
    model: "Aurora Frost",
    description: "Starter quartz reference inspired by northern auroras and gentle evenings.",
    year: "2021",
    tags: ["quartz", "omega", "quartz", "dress"],
    facts: [
      "Starter-tier pacing: quick enjoyment wind-up with modest cash gain and zero reserve drain.",
      "Designed to feel accessible: low price, bright dial, and traceable tags for easy discovery.",
      "Tags include quartz and quartz so catalog filters and lane language highlight affordability.",
    ],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "/catalog/placeholders/quartz-tier.svg",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "omega-seashore-drift",
    brand: "Omega",
    model: "Seashore Drift",
    description: "Sporty quartz field watch that celebrates coastal fog and high legibility.",
    year: "2020",
    tags: ["quartz", "omega", "quartz", "sport"],
    facts: [
      "Starter tier: tuned for momentum with balanced enjoyment/cash deltas and forgiving gates.",
      "Low reserve impact keeps the experience stable on mobile runs and rapid sessions.",
      "Sport and quartz tags point tests toward the low lane, preserving the envisioned pacing.",
    ],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "/catalog/placeholders/quartz-tier.svg",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "jaeger-lecoultre-atmos-vsp",
    brand: "Jaeger-LeCoultre",
    model: "Atmos VSP",
    description: "Classic automatic with a guilloché sunburst dial and soft blue highlights.",
    year: "2019",
    tags: ["automatic", "jaeger-lecoultre", "automatic", "dress"],
    facts: [
      "Mid-tier pacing: double the enjoyment of quartz watches, with moderate cash weighting.",
      "Reserve-friendly rotor locks this tier into reliable automatic engagement.",
      "Classic tags keep the lane names aligned while spotlighting a refined mechanical voice.",
    ],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "/catalog/placeholders/mid-tier.svg",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "cartier-ballon-de-lumiere-chrono",
    brand: "Cartier",
    model: "Ballon de Lumière Chrono",
    description: "Cartier manual with polished case, mid-tier pricing, and luminous numerals.",
    year: "2018",
    tags: ["manual", "cartier", "dress", "luxury"],
    facts: [
      "Chronograph mid-tier: heavier cash jump offset by prestige cues and satisfying winding.",
      "The tier mixing keeps watch pacing predictable for marketing stories and QA checks.",
      "Chronograph tags anchor the lane copy to timing and show off the boosted cash story.",
    ],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "/catalog/placeholders/mid-tier.svg",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "audemars-piguet-luminous-tourbillon",
    brand: "Audemars Piguet",
    model: "Luminous Tourbillon",
    description:
      "Skeletonized tourbillon with polished bridges and a luminous halo for selective collectors.",
    year: "2017",
    tags: ["tourbillon", "audemars-piguet", "luxury", "prestige"],
    facts: [
      "Luxury tier: steep cash gate with a pronounced enjoyment delta to justify prestige messaging.",
      "Tourbillon focus emphasizes reserve-rich interactions and exclusive discovery cadence.",
      "Tourbillon and luxury tags keep the catalog lane rooted in the VIP narrative.",
    ],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl: "/catalog/placeholders/lux-tier.svg",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "rolex-celestial-tourbillon",
    brand: "Rolex",
    model: "Celestial Tourbillon",
    description: "Rolex tourbillon with a midnight blue dial and constellation-inspired indices.",
    year: "2016",
    tags: ["tourbillon", "rolex", "luxury", "celestial"],
    facts: [
      "Luxury pacing keeps the tier rare, so each discovery unlocks record-high bonuses.",
      "Enjoyment/cash delta is tuned to leave room for Atelier resets and prestige stacking.",
      "Celestial and tourbillon tags reinforce the luxe lane copy while supporting filter copy.",
    ],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl: "/catalog/placeholders/lux-tier.svg",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
];

const MOVEMENT_EXPANSION_ENTRIES: CatalogEntryBase[] = [
  {
    id: "seiko-astron-gps-solar-ssj003",
    brand: "Seiko",
    model: "Astron GPS Solar SSJ003",
    description: "Real reference profile for Seiko Astron GPS Solar SSJ003.",
    year: "2022",
    tags: ["quartz", "seiko", "sport", "gps"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.seikowatches.com/global-en/products/astron/ssj003",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "casio-g-shock-dw-5600e",
    brand: "Casio",
    model: "G-SHOCK DW-5600E",
    description: "Real reference profile for Casio G-SHOCK DW-5600E.",
    year: "2021",
    tags: ["quartz", "casio", "sport", "digital"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.casio.com/us/watches/gshock/product.DW-5600E-1V/",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "citizen-the-citizen-aq4020-54y",
    brand: "Citizen",
    model: "The Citizen AQ4020-54Y",
    description: "Real reference profile for Citizen The Citizen AQ4020-54Y.",
    year: "2021",
    tags: ["quartz", "citizen", "dress"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl:
        "https://www.citizenwatch-global.com/the-citizen/lineup/5sec/AQ4020-54Y/index.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "grand-seiko-sbgx261",
    brand: "Grand Seiko",
    model: "SBGX261",
    description: "Real reference profile for Grand Seiko SBGX261.",
    year: "2023",
    tags: ["quartz", "grand seiko", "dress"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.grand-seiko.com/us-en/collections/sbgx261g",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "longines-conquest-vhp-l37164966",
    brand: "Longines",
    model: "Conquest V.H.P. L3.716.4.96.6",
    description: "Real reference profile for Longines Conquest V.H.P.",
    year: "2020",
    tags: ["quartz", "longines", "sport"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.longines.com/p/watch-conquest-v-h-p-l3-716-4-96-6",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "breitling-aerospace-evo-e7936310",
    brand: "Breitling",
    model: "Aerospace Evo E7936310",
    description: "Real reference profile for Breitling Aerospace Evo.",
    year: "2020",
    tags: ["quartz", "breitling", "aviation"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.breitling.com/us-en/watches/professional/aerospace-evo/",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "tag-heuer-aquaracer-way111a",
    brand: "TAG Heuer",
    model: "Aquaracer WAY111A",
    description: "Real reference profile for TAG Heuer Aquaracer WAY111A.",
    year: "2019",
    tags: ["quartz", "tag heuer", "diver"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl:
        "https://www.tagheuer.com/us/en/timepieces/collections/tag-heuer-aquaracer/41-mm-quartz/WAY111A.BA0928.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "tissot-prx-quartz-t1374101104100",
    brand: "Tissot",
    model: "PRX Quartz T137.410.11.041.00",
    description: "Real reference profile for Tissot PRX Quartz.",
    year: "2022",
    tags: ["quartz", "tissot", "sport"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.tissotwatches.com/en-us/t1374101104100.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "bulova-lunar-pilot-96b251",
    brand: "Bulova",
    model: "Lunar Pilot 96B251",
    description: "Real reference profile for Bulova Lunar Pilot 96B251.",
    year: "2021",
    tags: ["quartz", "bulova", "manual"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.bulova.com/us/en/product/96B251.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "hamilton-jazzmaster-quartz-h32451131",
    brand: "Hamilton",
    model: "Jazzmaster Quartz H32451131",
    description: "Real reference profile for Hamilton Jazzmaster Quartz.",
    year: "2020",
    tags: ["quartz", "hamilton", "dress"],
    image: {
      url: "/catalog/placeholders/quartz-tier.svg",
      sourceUrl: "https://www.hamiltonwatch.com/en-int/h32451131-jazzmaster-gent-quartz.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "omega-speedmaster-moonwatch-professional-31030425001001",
    brand: "Omega",
    model: "Speedmaster Moonwatch Professional 310.30.42.50.01.001",
    description: "Real reference profile for Omega Speedmaster Moonwatch Professional.",
    year: "2021",
    tags: ["manual", "omega", "sport"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl:
        "https://www.omegawatches.com/watch-omega-speedmaster-moonwatch-professional-co-axial-master-chronometer-chronograph-42-mm-31030425001001",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "patek-philippe-calatrava-6119g",
    brand: "Patek Philippe",
    model: "Calatrava 6119G",
    description: "Real reference profile for Patek Philippe Calatrava 6119G.",
    year: "2021",
    tags: ["manual", "patek philippe", "dress"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "https://www.patek.com/en/collection/calatrava/6119G-001",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "a-lange-sohne-lange-1-191-039",
    brand: "A. Lange & Sohne",
    model: "Lange 1 191.039",
    description: "Real reference profile for A. Lange & Sohne Lange 1.",
    year: "2020",
    tags: ["manual", "a. lange & sohne", "dress"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "https://www.alange-soehne.com/us-en/timepieces/lange-1/lange-1",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "nomos-tangente-38-165",
    brand: "Nomos",
    model: "Tangente 38 Ref. 165",
    description: "Real reference profile for Nomos Tangente 38.",
    year: "2023",
    tags: ["manual", "nomos", "dress"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "https://nomos-glashuette.com/en/tangente/tangente-38-165",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "panerai-radiomir-base-logo-pam00753",
    brand: "Panerai",
    model: "Radiomir Base Logo PAM00753",
    description: "Real reference profile for Panerai Radiomir Base Logo PAM00753.",
    year: "2019",
    tags: ["manual", "panerai", "sport"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl:
        "https://www.panerai.com/us/en/collections/watch-collection/radiomir/pam00753-radiomir-base-logo---45mm.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "iwc-portugieser-hand-wound-eight-days-iw510203",
    brand: "IWC",
    model: "Portugieser Hand-Wound Eight Days IW510203",
    description: "Real reference profile for IWC Portugieser Hand-Wound Eight Days.",
    year: "2019",
    tags: ["manual", "iwc", "dress"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl:
        "https://www.iwc.com/us/en/watch-collections/portugieser/iw510203-portugieser-hand-wound-eight-days.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "jaeger-lecoultre-reverso-tribute-monoface-q3978480",
    brand: "Jaeger-LeCoultre",
    model: "Reverso Tribute Monoface Q3978480",
    description: "Real reference profile for Jaeger-LeCoultre Reverso Tribute Monoface.",
    year: "2022",
    tags: ["manual", "jaeger-lecoultre", "dress"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "https://www.jaeger-lecoultre.com/us-en/watches/reverso/reverso-tribute",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "breguet-tradition-7027br-g9-9v6",
    brand: "Breguet",
    model: "Tradition 7027BR/G9/9V6",
    description: "Real reference profile for Breguet Tradition 7027.",
    year: "2018",
    tags: ["manual", "breguet", "dress"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "https://www.breguet.com/en/timepieces/tradition/7027",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "fp-journe-chronometre-bleu",
    brand: "F.P. Journe",
    model: "Chronometre Bleu",
    description: "Real reference profile for F.P. Journe Chronometre Bleu.",
    year: "2018",
    tags: ["manual", "f.p. journe", "dress"],
    image: {
      url: "/catalog/placeholders/mid-tier.svg",
      sourceUrl: "https://www.fpjourne.com/en/collection/classique-collection/chronometre-bleu",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "breguet-classique-tourbillon-3357",
    brand: "Breguet",
    model: "Classique Tourbillon 3357",
    description: "Real reference profile for Breguet Classique Tourbillon 3357.",
    year: "2019",
    tags: ["tourbillon", "breguet", "dress"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl: "https://www.breguet.com/en/timepieces/classique/3357",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "patek-philippe-grand-complications-5303r",
    brand: "Patek Philippe",
    model: "Grand Complications 5303R",
    description: "Real reference profile for Patek Philippe Grand Complications 5303R.",
    year: "2020",
    tags: ["tourbillon", "patek philippe", "dress"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl: "https://www.patek.com/en/collection/grand-complications/5303R-001",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "vacheron-constantin-traditionnelle-tourbillon-6000t",
    brand: "Vacheron Constantin",
    model: "Traditionnelle Tourbillon 6000T",
    description: "Real reference profile for Vacheron Constantin Traditionnelle Tourbillon.",
    year: "2021",
    tags: ["tourbillon", "vacheron constantin", "dress"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl:
        "https://www.vacheron-constantin.com/ww/en/collections/traditionnelle/6000t-000r-b346.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "audemars-piguet-royal-oak-selfwinding-flying-tourbillon-26730st",
    brand: "Audemars Piguet",
    model: "Royal Oak Selfwinding Flying Tourbillon 26730ST",
    description:
      "Real reference profile for Audemars Piguet Royal Oak Selfwinding Flying Tourbillon.",
    year: "2022",
    tags: ["tourbillon", "audemars piguet", "sport"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl:
        "https://www.audemarspiguet.com/com/en/watch-collection/royal-oak/26730ST.OO.1320ST.01.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "jaeger-lecoultre-master-grande-tradition-tourbillon-cylindrique",
    brand: "Jaeger-LeCoultre",
    model: "Master Grande Tradition Tourbillon Cylindrique",
    description: "Real reference profile for Jaeger-LeCoultre Master Grande Tradition Tourbillon.",
    year: "2020",
    tags: ["tourbillon", "jaeger-lecoultre", "dress"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl:
        "https://www.jaeger-lecoultre.com/us-en/watches/master-grande-tradition/master-grande-tradition-tourbillon-cylindrique",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "a-lange-sohne-tourbograph-perpetual-honeygold",
    brand: "A. Lange & Sohne",
    model: "Tourbograph Perpetual Honeygold",
    description: "Real reference profile for A. Lange & Sohne Tourbograph Perpetual.",
    year: "2021",
    tags: ["tourbillon", "a. lange & sohne", "dress"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl: "https://www.alange-soehne.com/us-en/timepieces/tourbograph-perpetual-honeygold",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "girard-perregaux-la-esmeralda-tourbillon-99274",
    brand: "Girard-Perregaux",
    model: "La Esmeralda Tourbillon 99274",
    description: "Real reference profile for Girard-Perregaux La Esmeralda Tourbillon.",
    year: "2019",
    tags: ["tourbillon", "girard-perregaux", "dress"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl: "https://www.girard-perregaux.com/row_en/99274-52-000-ba6a.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "blancpain-villeret-tourbillon-volant-66260-3633-55b",
    brand: "Blancpain",
    model: "Villeret Tourbillon Volant 66260-3633-55B",
    description: "Real reference profile for Blancpain Villeret Tourbillon Volant.",
    year: "2020",
    tags: ["tourbillon", "blancpain", "dress"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl:
        "https://www.blancpain.com/en/villeret/tourbillon-volant-heures-sautantes-66260-3633-55b",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "hublot-mp-09-tourbillon-bi-axis-910-nx-0001-rx",
    brand: "Hublot",
    model: "MP-09 Tourbillon Bi-Axis 910.NX.0001.RX",
    description: "Real reference profile for Hublot MP-09 Tourbillon Bi-Axis.",
    year: "2019",
    tags: ["tourbillon", "hublot", "sport"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl: "https://www.hublot.com/en-us/watches/mp/mp-09-tourbillon-bi-axis",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
  {
    id: "tag-heuer-carrera-tourbillon-heuer-02t-cbu2050-fc8316",
    brand: "TAG Heuer",
    model: "Carrera Tourbillon Chronograph CBU2050.FC8316",
    description: "Real reference profile for TAG Heuer Carrera Tourbillon Chronograph.",
    year: "2021",
    tags: ["tourbillon", "tag heuer", "sport"],
    image: {
      url: "/catalog/placeholders/lux-tier.svg",
      sourceUrl:
        "https://www.tagheuer.com/us/en/timepieces/collections/tag-heuer-carrera/45-mm-calibre-heuer02t-automatic/CBU2050.FC8316.html",
      licenseName: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      author: "Emily Idle Team",
      attribution: "Emily Idle Team (CC0)",
    },
  },
];

const WIKIMEDIA_BASE_URL = "https://upload.wikimedia.org/wikipedia/commons/";
const BASE_URL =
  typeof import.meta === "object" &&
  "env" in import.meta &&
  typeof import.meta.env.BASE_URL === "string"
    ? import.meta.env.BASE_URL
    : "/";
const LOCAL_CATALOG_ROOT = `${BASE_URL}catalog/`;
const TIER_PLACEHOLDER_FILES: Record<CatalogTierId, string> = {
  quartz: "quartz-tier.svg",
  automatic: "mid-tier.svg",
  manual: "mid-tier.svg",
  tourbillon: "lux-tier.svg",
};
const LOCAL_CATALOG_OVERRIDES: Record<string, string> = {
  "0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo%2C_met%C3%A0_anni_Novanta.jpg":
    "0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo,_meta_anni_Novanta.jpg",
  "b/b1/Rolex_Datejust_ref._16013%2C_seconda_met%C3%A0_anni_%2770-primi_%2780.jpg":
    "b/b1/Rolex_Datejust_ref._16013,_seconda_meta_anni_'70-primi_'80.jpg",
};
const PLACEHOLDER_CATALOG_IMAGE_PATTERN = /^\/?catalog\/placeholders\/[^/]+\.svg$/;
const PLACEHOLDER_SOURCE_LABEL = "Wikimedia Commons reference image metadata";
const PLACEHOLDER_TIER_REPRESENTATIVE_IMAGES: Readonly<Record<CatalogTierId, CatalogImage>> = {
  quartz: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/02/Rolex_Day-Date_Lacquered_Stella_Dial.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_Day-Date_Lacquered_Stella_Dial.jpg",
    licenseName: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    author: "Kevin Sweeney",
    attribution: "File:Rolex Day-Date Lacquered Stella Dial.jpg by Kevin Sweeney (CC0)",
  },
  automatic: {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Jaeger-LeCoultre_men%27s_dress_watch_ca._1950s.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_men%27s_dress_watch_ca._1950s.jpg",
    licenseName: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    author: "Kjetil Ree",
    attribution:
      "File:Jaeger-LeCoultre men's dress watch ca. 1950s.jpg by Kjetil Ree (CC BY-SA 3.0)",
  },
  manual: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/04/Rolex_Daytona_ref._6265_in_oro%2C_primi_anni_Settanta.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Daytona_ref._6265_in_oro,_primi_anni_Settanta.jpg",
    licenseName: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    author: "EMore98",
    attribution:
      "File:Rolex Daytona ref. 6265 in oro, primi anni Settanta.jpg by EMore98 (CC BY-SA 4.0)",
  },
  tourbillon: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Audemars_Piguet_ref._25831_con_datario%2C_riserva_di_carica_e_tourbillon%2C_risalente_al_1997.jpg",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_ref._25831_con_datario,_riserva_di_carica_e_tourbillon,_risalente_al_1997.jpg",
    licenseName: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    author: "EMore98",
    attribution:
      "File:Audemars Piguet ref. 25831 con datario, riserva di carica e tourbillon, risalente al 1997.jpg by EMore98 (CC BY-SA 4.0)",
  },
};
const MOVEMENT_TAGS = new Set(["quartz", "automatic", "manual", "tourbillon"]);
const SYNTHETIC_ENTRY_IDS = new Set([
  "omega-aurora-frost",
  "omega-seashore-drift",
  "jaeger-lecoultre-atmos-vsp",
  "cartier-ballon-de-lumiere-chrono",
  "audemars-piguet-luminous-tourbillon",
  "rolex-celestial-tourbillon",
]);

const CALIBER_BY_ENTRY_ID: Partial<Record<string, string>> = {
  "seiko-astron-gps-solar-ssj003": "Seiko 3X62",
  "casio-g-shock-dw-5600e": "Casio Module 3229",
  "citizen-the-citizen-aq4020-54y": "Citizen A060",
  "grand-seiko-sbgx261": "Grand Seiko 9F62",
  "longines-conquest-vhp-l37164966": "ETA F06.111 (VHP)",
  "breitling-aerospace-evo-e7936310": "Breitling Caliber 79",
  "tag-heuer-aquaracer-way111a": "Ronda 6004.B",
  "tissot-prx-quartz-t1374101104100": "ETA F06.115",
  "bulova-lunar-pilot-96b251": "Bulova NP20",
  "hamilton-jazzmaster-quartz-h32451131": "ETA F06.111",
  "omega-speedmaster-moonwatch-professional-31030425001001": "Omega Caliber 3861",
  "patek-philippe-calatrava-6119g": "Patek Philippe Caliber 30-255 PS",
  "a-lange-sohne-lange-1-191-039": "A. Lange & Sohne Caliber L121.1",
  "nomos-tangente-38-165": "Nomos Alpha",
  "panerai-radiomir-base-logo-pam00753": "Panerai Caliber P.6000",
  "iwc-portugieser-hand-wound-eight-days-iw510203": "IWC Caliber 59210",
  "jaeger-lecoultre-reverso-tribute-monoface-q3978480": "Jaeger-LeCoultre Caliber 822",
  "breguet-tradition-7027br-g9-9v6": "Breguet Caliber 507DR1",
  "fp-journe-chronometre-bleu": "F.P. Journe Caliber 1304",
  "breguet-classique-tourbillon-3357": "Breguet Caliber 558",
  "patek-philippe-grand-complications-5303r": "Patek Philippe Caliber R TO 27 PS",
  "vacheron-constantin-traditionnelle-tourbillon-6000t": "Vacheron Constantin Caliber 2160",
  "audemars-piguet-royal-oak-selfwinding-flying-tourbillon-26730st": "Audemars Piguet Caliber 2950",
  "jaeger-lecoultre-master-grande-tradition-tourbillon-cylindrique": "Jaeger-LeCoultre Caliber 978",
  "a-lange-sohne-tourbograph-perpetual-honeygold": "A. Lange & Sohne Caliber L133.1",
  "girard-perregaux-la-esmeralda-tourbillon-99274": "Girard-Perregaux Caliber GP09600",
  "blancpain-villeret-tourbillon-volant-66260-3633-55b": "Blancpain Caliber 25C",
  "hublot-mp-09-tourbillon-bi-axis-910-nx-0001-rx": "Hublot Caliber HUB9009.H1.RA",
  "tag-heuer-carrera-tourbillon-heuer-02t-cbu2050-fc8316": "TAG Heuer Caliber Heuer 02T",
};

const CATALOG_AUDIT_TIMESTAMP = "2026-02-15";

type CatalogMovementAudit = {
  movementType: CatalogTierId;
  movementSourceLabel: string;
  movementSourceUrl: string;
};

const AUDITED_MOVEMENT_BY_ENTRY_ID: Readonly<Record<string, CatalogMovementAudit>> = {
  "rolex-calibrorolex": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Calibrorolex.jpg",
  },
  "rolex-quadrante-tropical-di-rolex-gmt-master-ref-1675-long-e": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Quadrante_tropical_di_Rolex_GMT-Master_ref._1675_Long_E.jpg",
  },
  "rolex-rolex-gmt-master-ii-ref-126713grnr": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_GMT-Master_II_ref._126713GRNR.jpg",
  },
  "rolex-rolex-gmt-master-ref-16700": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_GMT-Master_ref._16700.jpg",
  },
  "rolex-rolex-daytona-ref-6265-in-oro-primi-anni-settanta": {
    movementType: "manual",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Daytona_ref._6265_in_oro,_primi_anni_Settanta.jpg",
  },
  "rolex-the-real-thing-22119277278": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:The_Real_Thing_(22119277278).jpg",
  },
  "rolex-rolex-oyster-perpetual-ref-277200-con-quadrante-color-lavanda": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Oyster_Perpetual_ref._277200_con_quadrante_color_lavanda.jpg",
  },
  "rolex-rolex-oyster-perpetual-con-quadrante-celebration": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Oyster_Perpetual_con_quadrante_Celebration.jpg",
  },
  "rolex-particolare-di-un-exclamation-point-dial-su-un-rolex-gmt-master-ref-1675-la-ghiera-sbiadita-detta-anche-faded-o-ghost":
    {
      movementType: "automatic",
      movementSourceLabel: "Wikimedia Commons reference image metadata",
      movementSourceUrl:
        "https://commons.wikimedia.org/wiki/File:Particolare_di_un_Exclamation_point_dial_su_un_Rolex_GMT-Master_ref._1675._La_ghiera_sbiadita_%C3%A8_detta_anche_faded_o_ghost..jpg",
    },
  "rolex-macro-photography-of-a-rolex-watch": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Macro_photography_of_a_Rolex_watch.jpg",
  },
  "rolex-rolex-oyster-perpetual-ref-116000-con-quadrante-explorer": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Oyster_Perpetual_ref._116000_con_quadrante_Explorer.jpg",
  },
  "rolex-rolex-gmt-master-ii-ref-16710t": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_GMT_Master_II_ref._16710T.jpg",
  },
  "rolex-rolex-pocket-watch-in-box": {
    movementType: "manual",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex_pocket_watch_in_box.jpg",
  },
  "rolex-rolex-datejust-ref-16220-tapestry-dial": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Datejust_ref._16220_tapestry_dial.jpg",
  },
  "rolex-rolex-watches-helsinki2": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex-watches-Helsinki2.jpg",
  },
  "rolex-montre-laroche-posay-water-resistant-rolex-submariner": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Montre_Laroche-Posay_Water_resistant_;_Rolex_submariner.jpg",
  },
  "rolex-rolex-day-date-lacquered-stella-dial": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Day-Date_Lacquered_Stella_Dial.jpg",
  },
  "rolex-watch-la-roche-posay": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Watch_La_Roche-Posay.jpg",
  },
  "rolex-rolex-datejust-ref-16013-seconda-met-anni-70-primi-80": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_Datejust_ref._16013,_seconda_met%C3%A0_anni_%2770-primi_%2780.jpg",
  },
  "rolex-rolex-women-watch": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex.women_watch.jpg",
  },
  "rolex-ultimate-in-rose-gold-wristwatches-rcwatches": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Ultimate_in_Rose_Gold_Wristwatches_RCWATCHES.jpg",
  },
  "rolex-rolex-perrelet-perrolex": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Rolex%2BPerrelet_%3D_Perrolex.jpg",
  },
  "rolex-rolex-watch-ladies-datejust-1987": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Rolex_watch_ladies_Datejust_1987.jpg",
  },
  "rolex-milgaussnew": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Milgaussnew.jpg",
  },
  "jaeger-lecoultre-jaeger-lecoultre-reverso-2011": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Reverso_2011.jpg",
  },
  "jaeger-lecoultre-balance-of-a-wristwatch-jaeger-lecoultre-master-eight-days-perpetual-squelette":
    {
      movementType: "automatic",
      movementSourceLabel: "Wikimedia Commons reference image metadata",
      movementSourceUrl:
        "https://commons.wikimedia.org/wiki/File:Balance_of_a_wristwatch_Jaeger-LeCoultre_Master_Eight_Days_Perpetual_Squelette.png",
    },
  "jaeger-lecoultre-jaeger-lecoultre-memovox-model-e855-with-calibre-k825-2": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Memovox_model_E855_with_calibre_K825_(2).JPG",
  },
  "jaeger-lecoultre-jaeger-lecoultre-reverso": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre-Reverso.jpg",
  },
  "jaeger-lecoultre-jaeger-lecoultre-mastereightdaysperpetualsquelette-cropped-twice": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_(cropped_twice).png",
  },
  "jaeger-lecoultre-jaeger-lecoultre-img-0991": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Jaeger-Lecoultre_img_0991.jpg",
  },
  "jaeger-lecoultre-jaeger-lecoultre-e502-futurematic": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_E502_Futurematic.JPG",
  },
  "jaeger-lecoultre-jaeger-lecoultre-memovox-model-e855-with-calibre-k825": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Memovox_model_E855_with_calibre_K825.JPG",
  },
  "jaeger-lecoultre-detailed-view-on-balance-and-rotor-of-jaeger-lecoultre-watch": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Detailed_view_on_balance_and_rotor_of_Jaeger-LeCoultre_watch.jpg",
  },
  "jaeger-lecoultre-jaeger-lecoultre-men-s-dress-watch-ca-1950s": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_men%27s_dress_watch_ca._1950s.jpg",
  },
  "jaeger-lecoultre-jaeger-lecoultre-mastereightdaysperpetualsquelette-cropped": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_cropped.png",
  },
  "jaeger-lecoultre-jaeger-lecoultre-caliber-k916-with-eu-version-rotor": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_caliber_K916_with_EU_version_rotor.jpg",
  },
  "jaeger-lecoultre-jaeger-lecoultre-reverso-anni-2000": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_Reverso,_anni_2000.jpg",
  },
  "jaeger-lecoultre-jaeger-lecoultre-mastereightdaysperpetualsquelette": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg",
  },
  "audemars-piguet-quanti-me": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Quanti%C3%A8me.jpg",
  },
  "audemars-piguet-audemars-piguet-ref-25831-con-datario-riserva-di-carica-e-tourbillon-risalente-al-1997":
    {
      movementType: "tourbillon",
      movementSourceLabel: "Wikimedia Commons reference image metadata",
      movementSourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_ref._25831_con_datario,_riserva_di_carica_e_tourbillon,_risalente_al_1997.jpg",
    },
  "audemars-piguet-audemars-piguet-dress-watch-in-oro-carica-manuale-fine-anni-70": {
    movementType: "manual",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_dress_watch_in_oro_carica_manuale,_fine_anni_%2770.jpg",
  },
  "audemars-piguet-audemars-piguet-royal-oak-ref-15202": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_ref._15202.jpg",
  },
  "audemars-piguet-audemars-piguet-royal-oak-cronograph-con-calibro-modulare-ref-25721-primi-anni-novanta":
    {
      movementType: "automatic",
      movementSourceLabel: "Wikimedia Commons reference image metadata",
      movementSourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_Cronograph_con_calibro_modulare,_ref._25721._Primi_anni_Novanta.jpg",
    },
  "audemars-piguet-audemars-piguet-royal-oak-in-oro-con-calendario-perpetuo-met-anni-novanta": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo,_met%C3%A0_anni_Novanta.jpg",
  },
  "audemars-piguet-audemars-2385": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Audemars_2385.jpg",
  },
  "audemars-piguet-royal-oak-automatic": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Royal_Oak_Automatic_.png",
  },
  "audemars-piguet-calibro-audemars-piguet-7121-con-massa-oscillante-personalizzata-con-il-numero-50-per-celebrare-i-cinquant-anni-dalla-nascita-del-royal-oak-risalente-al-2022":
    {
      movementType: "automatic",
      movementSourceLabel: "Wikimedia Commons reference image metadata",
      movementSourceUrl:
        "https://commons.wikimedia.org/wiki/File:Calibro_Audemars_Piguet_7121_con_massa_oscillante_personalizzata_con_il_numero_50,_per_celebrare_i_cinquant%27anni_dalla_nascita_del_Royal_Oak._Risalente_al_2022.jpg",
    },
  "audemars-piguet-audemars-2385-royal-oak-resized": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_2385_Royal_Oak_resized.jpg",
  },
  "audemars-piguet-ultimate-in-rose-gold-wristwatches-rcwatches": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Ultimate_in_Rose_Gold_Wristwatches_RCWATCHES.jpg",
  },
  "audemars-piguet-audemars-piguet-code-11-59-manual-ref-26393": {
    movementType: "manual",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_CODE_11.59_Chronograph_ref._26393.jpg",
  },
  "audemars-piguet-audemars-piguet-royal-oak-offshore-diver": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_Offshore_Diver.jpg",
  },
  "audemars-piguet-audemars-piguet-royal-oak-in-oro-e-tantalio-fine-anni-80-primi-90": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_in_oro_e_tantalio,_fine_anni_%2780-primi_%2790.jpg",
  },
  "audemars-piguet-audemars-piguet-royal-oak-tradition-d-excellence-4-ref-25969-risalente-al-2004":
    {
      movementType: "automatic",
      movementSourceLabel: "Wikimedia Commons reference image metadata",
      movementSourceUrl:
        "https://commons.wikimedia.org/wiki/File:Audemars_Piguet_Royal_Oak_Tradition_d%27Excellence_4,_ref._25969,_risalente_al_2004.jpg",
    },
  "omega-omega-seamaster-de-ville-1970": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Omega_Seamaster_De_Ville_1970.jpg",
  },
  "omega-omega-seamaster-120m-1998": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Omega_seamaster_120m_1998.jpg",
  },
  "omega-omega-speedmaster-reduced-351050": {
    movementType: "automatic",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl:
      "https://commons.wikimedia.org/wiki/File:Omega_speedmaster_reduced_351050.jpg",
  },
  "cartier-cartier-tank": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Cartier_Tank.jpg",
  },
  "cartier-cartier-tank-must-2021": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Cartier_Tank_Must,_2021.jpg",
  },
  "cartier-cartier-santos-1988": {
    movementType: "quartz",
    movementSourceLabel: "Wikimedia Commons reference image metadata",
    movementSourceUrl: "https://commons.wikimedia.org/wiki/File:Cartier_Santos_1988.jpg",
  },
  "seiko-astron-gps-solar-ssj003": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.seikowatches.com/global-en/products/astron/ssj003",
  },
  "casio-g-shock-dw-5600e": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.casio.com/us/watches/gshock/product.DW-5600E-1V/",
  },
  "citizen-the-citizen-aq4020-54y": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.citizenwatch-global.com/the-citizen/lineup/5sec/AQ4020-54Y/index.html",
  },
  "grand-seiko-sbgx261": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.grand-seiko.com/us-en/collections/sbgx261g",
  },
  "longines-conquest-vhp-l37164966": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.longines.com/p/watch-conquest-v-h-p-l3-716-4-96-6",
  },
  "breitling-aerospace-evo-e7936310": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.breitling.com/us-en/watches/professional/aerospace-evo/",
  },
  "tag-heuer-aquaracer-way111a": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.tagheuer.com/us/en/timepieces/collections/tag-heuer-aquaracer/41-mm-quartz/WAY111A.BA0928.html",
  },
  "tissot-prx-quartz-t1374101104100": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.tissotwatches.com/en-us/t1374101104100.html",
  },
  "bulova-lunar-pilot-96b251": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.bulova.com/us/en/product/96B251.html",
  },
  "hamilton-jazzmaster-quartz-h32451131": {
    movementType: "quartz",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.hamiltonwatch.com/en-int/h32451131-jazzmaster-gent-quartz.html",
  },
  "omega-speedmaster-moonwatch-professional-31030425001001": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.omegawatches.com/watch-omega-speedmaster-moonwatch-professional-co-axial-master-chronometer-chronograph-42-mm-31030425001001",
  },
  "patek-philippe-calatrava-6119g": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.patek.com/en/collection/calatrava/6119G-001",
  },
  "a-lange-sohne-lange-1-191-039": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.alange-soehne.com/us-en/timepieces/lange-1/lange-1",
  },
  "nomos-tangente-38-165": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://nomos-glashuette.com/en/tangente/tangente-38-165",
  },
  "panerai-radiomir-base-logo-pam00753": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.panerai.com/us/en/collections/watch-collection/radiomir/pam00753-radiomir-base-logo---45mm.html",
  },
  "iwc-portugieser-hand-wound-eight-days-iw510203": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.iwc.com/us/en/watch-collections/portugieser/iw510203-portugieser-hand-wound-eight-days.html",
  },
  "jaeger-lecoultre-reverso-tribute-monoface-q3978480": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.jaeger-lecoultre.com/us-en/watches/reverso/reverso-tribute",
  },
  "breguet-tradition-7027br-g9-9v6": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.breguet.com/en/timepieces/tradition/7027",
  },
  "fp-journe-chronometre-bleu": {
    movementType: "manual",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.fpjourne.com/en/collection/classique-collection/chronometre-bleu",
  },
  "breguet-classique-tourbillon-3357": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.breguet.com/en/timepieces/classique/3357",
  },
  "patek-philippe-grand-complications-5303r": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.patek.com/en/collection/grand-complications/5303R-001",
  },
  "vacheron-constantin-traditionnelle-tourbillon-6000t": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.vacheron-constantin.com/ww/en/collections/traditionnelle/6000t-000r-b346.html",
  },
  "audemars-piguet-royal-oak-selfwinding-flying-tourbillon-26730st": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.audemarspiguet.com/com/en/watch-collection/royal-oak/26730ST.OO.1320ST.01.html",
  },
  "jaeger-lecoultre-master-grande-tradition-tourbillon-cylindrique": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.jaeger-lecoultre.com/us-en/watches/master-grande-tradition/master-grande-tradition-tourbillon-cylindrique",
  },
  "a-lange-sohne-tourbograph-perpetual-honeygold": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.alange-soehne.com/us-en/timepieces/tourbograph-perpetual-honeygold",
  },
  "girard-perregaux-la-esmeralda-tourbillon-99274": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.girard-perregaux.com/row_en/99274-52-000-ba6a.html",
  },
  "blancpain-villeret-tourbillon-volant-66260-3633-55b": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.blancpain.com/en/villeret/tourbillon-volant-heures-sautantes-66260-3633-55b",
  },
  "hublot-mp-09-tourbillon-bi-axis-910-nx-0001-rx": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl: "https://www.hublot.com/en-us/watches/mp/mp-09-tourbillon-bi-axis",
  },
  "tag-heuer-carrera-tourbillon-heuer-02t-cbu2050-fc8316": {
    movementType: "tourbillon",
    movementSourceLabel: "Official watch reference",
    movementSourceUrl:
      "https://www.tagheuer.com/us/en/timepieces/collections/tag-heuer-carrera/45-mm-calibre-heuer02t-automatic/CBU2050.FC8316.html",
  },
};

const BRAND_REFERENCE_SOURCE_URLS: Record<CatalogBrand, string> = {
  Rolex: "https://www.rolex.com/en-us/watches",
  "Jaeger-LeCoultre": "https://www.jaeger-lecoultre.com/us-en/watches",
  "Audemars Piguet": "https://www.audemarspiguet.com/com/en/watch-collection.html",
  Omega: "https://www.omegawatches.com/watches",
  Cartier: "https://www.cartier.com/en-us/watches.html",
  Seiko: "https://www.seikowatches.com/global-en/",
  Casio: "https://www.casio.com/us/watches/",
  Citizen: "https://www.citizenwatch-global.com/",
  "Grand Seiko": "https://www.grand-seiko.com/us-en/collections/",
  Longines: "https://www.longines.com/watches",
  Breitling: "https://www.breitling.com/us-en/watches/",
  "TAG Heuer": "https://www.tagheuer.com/us/en/timepieces/collections/",
  Tissot: "https://www.tissotwatches.com/en-us/men/main-collections.html",
  Bulova: "https://www.bulova.com/us/en/collection/mens/",
  Hamilton: "https://www.hamiltonwatch.com/en-int/men-watches.html",
  "Patek Philippe": "https://www.patek.com/en/collection",
  "A. Lange & Sohne": "https://www.alange-soehne.com/us-en/timepieces",
  Nomos: "https://nomos-glashuette.com/en/watches",
  Panerai: "https://www.panerai.com/us/en/collections/watch-collection.html",
  IWC: "https://www.iwc.com/us/en/watches.html",
  "F.P. Journe": "https://www.fpjourne.com/en/collection",
  Breguet: "https://www.breguet.com/en/timepieces",
  "Vacheron Constantin": "https://www.vacheron-constantin.com/ww/en/collections.html",
  "Girard-Perregaux": "https://www.girard-perregaux.com/row_en/",
  Blancpain: "https://www.blancpain.com/en/timepieces",
  Hublot: "https://www.hublot.com/en-us/watches",
};

const BRAND_PRICE_BASE_USD: Record<CatalogBrand, number> = {
  Rolex: 11_900,
  "Jaeger-LeCoultre": 12_400,
  "Audemars Piguet": 47_500,
  Omega: 8_300,
  Cartier: 6_800,
  Seiko: 2_200,
  Casio: 120,
  Citizen: 2_600,
  "Grand Seiko": 3_200,
  Longines: 1_600,
  Breitling: 4_500,
  "TAG Heuer": 3_200,
  Tissot: 450,
  Bulova: 650,
  Hamilton: 725,
  "Patek Philippe": 34_000,
  "A. Lange & Sohne": 52_000,
  Nomos: 2_500,
  Panerai: 5_900,
  IWC: 12_500,
  "F.P. Journe": 47_000,
  Breguet: 36_000,
  "Vacheron Constantin": 115_000,
  "Girard-Perregaux": 128_000,
  Blancpain: 96_000,
  Hublot: 172_000,
};

// Explicit Tier Sequence for Phase 46 lanes: quartz (low), automatic + manual (mid), tourbillon (luxury).
// Keeping this list in one place guarantees the lane order doesn’t drift when filters or sorts run.
export const CATALOG_TIER_SEQUENCE: ReadonlyArray<CatalogTierId> = [
  "quartz",
  "automatic",
  "manual",
  "tourbillon",
];

function resolveCatalogAssetUrl(path: string): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith(BASE_URL)
  ) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  if (normalizedPath.startsWith("catalog/")) {
    return `${BASE_URL}${normalizedPath}`;
  }
  return `${LOCAL_CATALOG_ROOT}${normalizedPath}`;
}

function getAuditedMovement(entryId: string): CatalogMovementAudit {
  const movementAudit = AUDITED_MOVEMENT_BY_ENTRY_ID[entryId];
  if (!movementAudit) {
    throw new Error(`Missing audited movement mapping for catalog entry: ${entryId}`);
  }
  return movementAudit;
}

function getMovementDefaults(
  movementType: CatalogTierId,
): Pick<
  CatalogMovementDetails,
  | "windingSystem"
  | "frequencyBph"
  | "powerReserveHours"
  | "jewelCount"
  | "escapement"
  | "movementNotes"
  | "unknownReason"
> {
  if (movementType === "quartz") {
    return {
      windingSystem: "battery",
      frequencyBph: 32_768,
      powerReserveHours: null,
      jewelCount: 0,
      escapement: null,
      movementNotes: "Battery-powered movement profile.",
      unknownReason: "Quartz movements do not use a mainspring reserve.",
    };
  }
  if (movementType === "automatic") {
    return {
      windingSystem: "self-winding",
      frequencyBph: 28_800,
      powerReserveHours: 48,
      jewelCount: 25,
      escapement: "Swiss lever",
      movementNotes: "Automatic rotor-driven movement profile.",
      unknownReason: null,
    };
  }
  if (movementType === "manual") {
    return {
      windingSystem: "hand-wound",
      frequencyBph: 21_600,
      powerReserveHours: 60,
      jewelCount: 21,
      escapement: "Swiss lever",
      movementNotes: "Hand-wound movement profile.",
      unknownReason: null,
    };
  }
  return {
    windingSystem: "tourbillon-manual",
    frequencyBph: 21_600,
    powerReserveHours: 80,
    jewelCount: 25,
    escapement: "Tourbillon regulator",
    movementNotes: "Tourbillon-class movement profile.",
    unknownReason: null,
  };
}

function inferTourbillonWindingSystem(entry: CatalogEntryBase): CatalogWindingSystem {
  const searchable = `${entry.id} ${entry.model} ${entry.description}`.toLowerCase();
  if (
    searchable.includes("selfwinding") ||
    searchable.includes("automatic") ||
    searchable.includes("heuer-02t") ||
    searchable.includes("26730st")
  ) {
    return "tourbillon-automatic";
  }
  return "tourbillon-manual";
}

function buildMovementDetails(entry: CatalogEntryBase): CatalogMovementDetails {
  const movementAudit = getAuditedMovement(entry.id);
  const movementType = movementAudit.movementType;
  const defaults = getMovementDefaults(movementType);
  const sourceAuthority = getSourceAuthority(movementAudit.movementSourceUrl);
  const windingSystem =
    movementType === "tourbillon" ? inferTourbillonWindingSystem(entry) : defaults.windingSystem;

  return {
    movementType,
    movementSourceType: sourceAuthority === "manufacturer" ? "primary" : "secondary",
    movementSourceUrl: movementAudit.movementSourceUrl,
    movementSourceLabel: movementAudit.movementSourceLabel,
    caliberName: CALIBER_BY_ENTRY_ID[entry.id] ?? "Unknown caliber",
    windingSystem,
    frequencyBph: defaults.frequencyBph,
    powerReserveHours: defaults.powerReserveHours,
    jewelCount: defaults.jewelCount,
    escapement: defaults.escapement,
    movementNotes: defaults.movementNotes,
    unknownReason:
      CALIBER_BY_ENTRY_ID[entry.id] || defaults.unknownReason === null
        ? defaults.unknownReason
        : "Detailed caliber specs were unavailable from current source metadata.",
  };
}

function getSourceAuthority(url: string): CatalogSourceAuthority {
  if (url.includes("chrono24.com")) {
    return "retailer";
  }
  if (url.includes("wikimedia.org") || url.includes("wikipedia.org")) {
    return "reference";
  }
  return "manufacturer";
}

function getMovementLabel(movementType: CatalogTierId): string {
  if (movementType === "tourbillon") {
    return "tourbillon-regulated mechanical";
  }
  return movementType;
}

function getBrandReferenceSource(entry: CatalogEntryBase): CatalogSourceReference {
  return {
    label: `${entry.brand} watch collection`,
    url: BRAND_REFERENCE_SOURCE_URLS[entry.brand],
    authority: "manufacturer",
  };
}

function getPriceSearchSource(entry: CatalogEntryBase): CatalogSourceReference {
  const query = encodeURIComponent(`${entry.brand} ${entry.model}`);
  return {
    label: "Chrono24 market search",
    url: `https://www.chrono24.com/search/index.htm?query=${query}`,
    authority: "retailer",
  };
}

function getEstimatedMarketPriceUsd(entry: CatalogEntryBase, movementType: CatalogTierId): number {
  const movementMultiplier = {
    quartz: 0.6,
    automatic: 1,
    manual: 1.2,
    tourbillon: 2.8,
  }[movementType];
  const yearAdjustment = entry.year === "Unknown" ? 1 : 1.03;
  const estimated = BRAND_PRICE_BASE_USD[entry.brand] * movementMultiplier * yearAdjustment;
  return Math.max(95, Math.round(estimated / 50) * 50);
}

function pushUniqueSourceReference(
  references: CatalogSourceReference[],
  source: CatalogSourceReference,
): void {
  if (references.some((existing) => existing.url === source.url)) {
    return;
  }
  references.push(source);
}

function buildSourceReferences(
  entry: CatalogEntryBase,
  movementDetails: CatalogMovementDetails,
): CatalogSourceReference[] {
  const references: CatalogSourceReference[] = [];
  pushUniqueSourceReference(references, {
    label: movementDetails.movementSourceLabel,
    url: movementDetails.movementSourceUrl,
    authority: getSourceAuthority(movementDetails.movementSourceUrl),
  });
  pushUniqueSourceReference(references, getBrandReferenceSource(entry));
  pushUniqueSourceReference(references, getPriceSearchSource(entry));
  return references;
}

function buildCatalogDetails(
  entry: CatalogEntryBase,
  movementDetails: CatalogMovementDetails,
): CatalogDetails {
  const sourceReferences = buildSourceReferences(entry, movementDetails);
  const collectorFacts = entry.facts ?? [];
  const movementLabel = getMovementLabel(movementDetails.movementType);
  const coreMovementFeature =
    movementDetails.caliberName === "Unknown caliber"
      ? `${movementLabel} movement profile validated from available catalog references.`
      : `${movementLabel} movement built around ${movementDetails.caliberName}.`;
  const windingFeature = `Winding system: ${movementDetails.windingSystem}.`;
  const reserveFeature =
    movementDetails.powerReserveHours === null
      ? "No mainspring reserve (electronic timekeeping profile)."
      : `Power reserve target: ${movementDetails.powerReserveHours} hours.`;
  const featureHighlights = Array.from(
    new Set([coreMovementFeature, windingFeature, reserveFeature, ...collectorFacts]),
  );
  const technicalSpecifications: CatalogTechnicalSpecification[] = [
    { label: "Reference", value: entry.model },
    { label: "Movement type", value: movementDetails.movementType },
    { label: "Caliber", value: movementDetails.caliberName },
    { label: "Winding", value: movementDetails.windingSystem },
    {
      label: "Frequency",
      value:
        movementDetails.frequencyBph === null
          ? "Not published"
          : `${movementDetails.frequencyBph.toLocaleString()} bph`,
    },
    {
      label: "Power reserve",
      value:
        movementDetails.powerReserveHours === null
          ? "Not applicable"
          : `${movementDetails.powerReserveHours} hours`,
    },
    {
      label: "Jewels",
      value:
        movementDetails.jewelCount === null ? "Not published" : `${movementDetails.jewelCount}`,
    },
    {
      label: "Escapement",
      value: movementDetails.escapement ?? "Not published",
    },
  ];
  const priceSource =
    sourceReferences.find((source) => source.authority === "retailer") ?? sourceReferences[0];
  const marketPricesUsd: CatalogMarketPriceEntry[] = [
    {
      label: "Estimated current market",
      amountUsd: getEstimatedMarketPriceUsd(entry, movementDetails.movementType),
      sourceLabel: priceSource.label,
      sourceUrl: priceSource.url,
      observedAt: CATALOG_AUDIT_TIMESTAMP,
    },
  ];
  const fullDescription = `${entry.brand} ${entry.model} is represented in the Emily Idle catalog as a ${movementLabel} reference. ${entry.description}`;

  return {
    fullDescription,
    featureHighlights,
    technicalSpecifications,
    marketPricesUsd,
    sourceReferences,
    auditTimestamp: CATALOG_AUDIT_TIMESTAMP,
  };
}

const CATALOG_ENTRIES_ALL = [...CATALOG_ENTRIES_BASE, ...MOVEMENT_EXPANSION_ENTRIES];
const CATALOG_ENTRIES_AUDITED = CATALOG_ENTRIES_ALL.filter(
  (entry) => !SYNTHETIC_ENTRY_IDS.has(entry.id),
);

for (const entry of CATALOG_ENTRIES_AUDITED) {
  if (!AUDITED_MOVEMENT_BY_ENTRY_ID[entry.id]) {
    throw new Error(`Missing audited movement source citation for catalog entry: ${entry.id}`);
  }
}

function isCatalogPlaceholderImage(path: string): boolean {
  return PLACEHOLDER_CATALOG_IMAGE_PATTERN.test(path);
}

export const CATALOG_ENTRIES: CatalogEntry[] = CATALOG_ENTRIES_AUDITED.map((entry) => {
  const movementDetails = buildMovementDetails(entry);
  const usesPlaceholderImage = isCatalogPlaceholderImage(entry.image.url);
  const resolvedImage = usesPlaceholderImage
    ? PLACEHOLDER_TIER_REPRESENTATIVE_IMAGES[movementDetails.movementType]
    : entry.image;
  const hasPlaceholderMovementSource = isCatalogPlaceholderImage(movementDetails.movementSourceUrl);
  const resolvedMovementDetails = hasPlaceholderMovementSource
    ? {
        ...movementDetails,
        movementSourceType: "secondary" as const,
        movementSourceUrl: resolvedImage.sourceUrl,
        movementSourceLabel: PLACEHOLDER_SOURCE_LABEL,
      }
    : movementDetails;

  return {
    ...entry,
    image: resolvedImage,
    ...resolvedMovementDetails,
    details: buildCatalogDetails(entry, resolvedMovementDetails),
  };
});

export function getCatalogEntryTags(entry: CatalogEntry): string[] {
  const normalized = entry.tags.map((tag) => tag.toLowerCase()).filter((tag) => tag.length > 0);
  const baseTags = normalized.filter((tag) => !MOVEMENT_TAGS.has(tag));
  return Array.from(new Set([...baseTags, entry.movementType]));
}

export function getCatalogImageUrl(entry: CatalogEntry): string {
  if (entry.image.url.startsWith(WIKIMEDIA_BASE_URL)) {
    const relativePath = entry.image.url.slice(WIKIMEDIA_BASE_URL.length);
    const localPath = LOCAL_CATALOG_OVERRIDES[relativePath] ?? relativePath;
    return resolveCatalogAssetUrl(localPath);
  }
  if (entry.image.url.startsWith("/catalog/") || entry.image.url.startsWith("catalog/")) {
    return resolveCatalogAssetUrl(entry.image.url);
  }
  return entry.image.url;
}

export function getCatalogFallbackImageUrl(entry: CatalogEntry): string {
  const fallbackFile = TIER_PLACEHOLDER_FILES[entry.movementType];
  return resolveCatalogAssetUrl(`catalog/placeholders/${fallbackFile}`);
}

export function getWatchModelTierBadge(
  modelId: string,
  tierBadgeFromModel?: TierBadgeDefinition,
): TierBadgeDefinition {
  if (tierBadgeFromModel) {
    return tierBadgeFromModel;
  }
  const entry = CATALOG_ENTRIES.find((candidate) => candidate.id === modelId);
  if (!entry) {
    return getTierBadgeByCatalogTier("quartz");
  }
  return getTierBadgeByCatalogTier(entry.movementType);
}
