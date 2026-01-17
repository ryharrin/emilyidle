export type CatalogBrand = "Rolex" | "Jaeger-LeCoultre" | "Audemars Piguet";

export type CatalogImage = {
  url: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  author: string;
  attribution: string;
};

export type CatalogEntry = {
  id: string;
  brand: CatalogBrand;
  model: string;
  description: string;
  year: string;
  tags: string[];
  image: CatalogImage;
};

export const CATALOG_ENTRIES: CatalogEntry[] = [
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
    id: "audemars-piguet-audemars-piguet-code-11-59-chronograph-ref-26393",
    brand: "Audemars Piguet",
    model: "Audemars Piguet CODE 11.59 Chronograph ref. 26393",
    description:
      "Open-license reference image of Audemars Piguet Audemars Piguet CODE 11.59 Chronograph ref. 26393.",
    year: "Unknown",
    tags: ["audemars piguet", "chronograph", "watch"],
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
];

const WIKIMEDIA_BASE_URL = "https://upload.wikimedia.org/wikipedia/commons/";
const LOCAL_CATALOG_ROOT = "/catalog/";
const MISSING_LOCAL_IMAGES = new Set([
  "d/df/Jaeger-LeCoultre_Reverso_2011.jpg",
  "4/45/Balance_of_a_wristwatch_Jaeger-LeCoultre_Master_Eight_Days_Perpetual_Squelette.png",
  "a/a7/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_%28cropped_twice%29.png",
  "8/81/Jaeger-LeCoultre_E502_Futurematic.JPG",
  "5/58/Jaeger-LeCoultre_Memovox_model_E855_with_calibre_K825.JPG",
  "2/28/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette_cropped.png",
  "2/25/Jaeger-LeCoultre_caliber_K916_with_EU_version_rotor.jpg",
  "c/c5/Jaeger-LeCoultre_Reverso%2C_anni_2000.jpg",
  "b/b5/Jaeger-LeCoultre_MasterEightDaysPerpetualSquelette.jpg",
  "f/fa/Quanti%C3%A8me.jpg",
  "c/cc/Audemars_Piguet_ref._25831_con_datario%2C_riserva_di_carica_e_tourbillon%2C_risalente_al_1997.jpg",
  "5/57/Audemars_Piguet_dress_watch_in_oro_carica_manuale%2C_fine_anni_%2770.jpg",
  "0/05/Audemars_Piguet_Royal_Oak_ref._15202.jpg",
  "6/68/Audemars_Piguet_Royal_Oak_Cronograph_con_calibro_modulare%2C_ref._25721._Primi_anni_Novanta.jpg",
  "0/0f/Audemars_Piguet_Royal_Oak_in_oro_con_calendario_perpetuo%2C_met%C3%A0_anni_Novanta.jpg",
  "a/aa/Audemars_2385.jpg",
  "3/35/Royal_Oak_Automatic_.png",
  "7/79/Calibro_Audemars_Piguet_7121_con_massa_oscillante_personalizzata_con_il_numero_50%2C_per_celebrare_i_cinquant%27anni_dalla_nascita_del_Royal_Oak._Risalente_al_2022.jpg",
  "0/0e/Audemars_2385_Royal_Oak_resized.jpg",
  "7/7d/Audemars_Piguet_CODE_11.59_Chronograph_ref._26393.jpg",
  "1/1e/Audemars_Piguet_Royal_Oak_Offshore_Diver.jpg",
  "3/3f/Audemars_Piguet_Royal_Oak_in_oro_e_tantalio%2C_fine_anni_%2780-primi_%2790.jpg",
  "2/23/Audemars_Piguet_Royal_Oak_Tradition_d%27Excellence_4%2C_ref._25969%2C_risalente_al_2004.jpg",
]);
const TIER_TAGS = new Set(["starter", "classic", "chronograph", "tourbillon"]);

function inferCatalogTier(entry: CatalogEntry, tags: string[]): string {
  const searchable = `${entry.model} ${entry.description}`.toLowerCase();
  const hasTag = (value: string) => tags.includes(value) || searchable.includes(value);

  if (hasTag("tourbillon")) {
    return "tourbillon";
  }
  if (hasTag("chronograph") || hasTag("daytona")) {
    return "chronograph";
  }
  if (hasTag("gmt") || hasTag("submariner")) {
    return "classic";
  }
  if (hasTag("reverso") || hasTag("royal-oak")) {
    return "classic";
  }
  if (entry.brand === "Audemars Piguet" || entry.brand === "Jaeger-LeCoultre") {
    return "classic";
  }
  return "starter";
}

export function getCatalogEntryTags(entry: CatalogEntry): string[] {
  const normalized = entry.tags.map((tag) => tag.toLowerCase()).filter((tag) => tag.length > 0);
  const baseTags = normalized.filter((tag) => !TIER_TAGS.has(tag));
  const tierTag = inferCatalogTier(entry, baseTags);
  return Array.from(new Set([...baseTags, tierTag]));
}

export function getCatalogImageUrl(entry: CatalogEntry): string {
  if (entry.image.url.startsWith(WIKIMEDIA_BASE_URL)) {
    const relativePath = entry.image.url.slice(WIKIMEDIA_BASE_URL.length);
    if (MISSING_LOCAL_IMAGES.has(relativePath)) {
      return entry.image.url;
    }
    return `${LOCAL_CATALOG_ROOT}${relativePath}`;
  }
  return entry.image.url;
}
