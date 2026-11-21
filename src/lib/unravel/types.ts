/* Shapes of src/data/seaad-mtg.json. The JSON is the single source of every word and number. */
export type Dict = Record<string, string>;

export interface Donor {
  id: string;
  age: string;
  sex: string;
  apoe4: string;
  adnc: string;
  braak: string;
  cognitive: string;
  braakBand: string;
  [key: string]: string;
}
export interface Grouping {
  id: string;
  key: string;
  label: string;
  plainLabel?: string;
  order: string[];
  ends?: string[];
  axisTitle?: string;
  bandNotes?: Dict;
  explainer?: string;
  drawerLine?: string;
  shortName?: string;
}
export interface Confounder { id: string; key: string; label: string }
export interface CellType { id: string; label: string; plainLabel?: string; colour?: string; plain?: string }
export interface Metric { id: string; label: string; plainLabel?: string; unit: string; decimals?: number }
export interface Series { metric: string; cellType: string; values: (number | null)[] }

export interface ClaimBlank { blank: string; options: string[]; correct: string; right: string; wrong: string }
export interface LimitOption { statement: string; applies: boolean; reason: string }
export interface CaseStudy {
  id: string;
  title: string;
  plainTitle: string;
  pickerLine: string;
  measurePhrase: string;
  views: { metric: string; cellType: string }[];
  grouping: string;
  intro: { background: string; known: string; gap: string };
  aims: { aim: string; h0: string; question: string; h1: { up: string; same: string; down: string } };
  methods: {
    measure: string;
    analysis: string;
    check: { question: string; options: string[]; correct: string; right: string; wrong: string };
  };
  results: { look: string; shows: string; exploratory?: string; exploratoryShows?: string };
  discussion: {
    claim: { parts: (string | ClaimBlank)[] };
    limits: { options: LimitOption[]; correct: boolean[] };
    published: string;
    publishedUrl: string;
    ageNote?: string;
    next: string;
    nextPreset: { cellType: string; metric: string; grouping: string };
  };
  abstract: { background: string; aim: string; result: string; conclusion: Dict };
}

export interface Insight {
  id: string;
  myth: string;
  headline: string;
  body: string;
  graphic: any;
  knot: null | { label: string; title: string; body: string; steps?: { scene: string; caption: string }[] };
  alt: string;
  nextLabel?: string;
}

export interface UnravelData {
  meta: any;
  config: Dict;
  ui: Dict;
  nav: Dict;
  hero: Dict;
  video: any;
  poll: any;
  lab: any;
  glossary: { term: string; plain: string }[];
  donors: Donor[];
  groupings: Grouping[];
  confounders: Confounder[];
  cellTypes: CellType[];
  metrics: Metric[];
  series: Series[];
  caseStudies: CaseStudy[];
  prize: any;
  ucas: any;
  teachers: any;
  footer: Dict;
  sections: any[];
  pivot: Dict;
  explore: any;
  writing: any;
  further: any;
  insights: Insight[];
  dataSteps: { caption: string; alt: string }[];
}
