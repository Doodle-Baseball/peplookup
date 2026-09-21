import 'server-only';
import type { Product, ResearchSections } from '@/lib/schema';

/**
 * DEV-ONLY placeholder compound content so product pages have something to
 * look at while building the UI. Never applied when NODE_ENV is "production"
 * (Next sets this for `next build`/`next start`), real research content must
 * be written and checked in the admin before it ships, per CLAUDE.md's "never
 * invent data" rule. Keyed by slug; only fills sections that are still empty,
 * so anything saved in the admin always wins. Nothing here is written to
 * Supabase. Evidence links are deliberately left empty rather than invented.
 */
interface DemoProductContent {
  forms: Product['forms'];
  intakeTypes: Product['intakeTypes'];
  purposePills: Product['purposePills'];
  research: Partial<ResearchSections>;
}

const DEMO_CONTENT: Record<string, DemoProductContent> = {
  'cjc-1295-no-dac': {
    forms: ['vial'],
    intakeTypes: ['injections'],
    purposePills: ['GH release', 'Body composition', 'Recovery research'],
    research: {
      benefits: [
        {
          title: 'Amplifies natural GH pulses',
          description:
            "Acts on pituitary GHRH receptors to increase the size of the body's own growth-hormone pulses in research models, rather than holding GH levels continuously high.",
        },
        {
          title: 'Short, pulse-matched activity',
          description:
            'Without the DAC (drug affinity complex) modification it clears within roughly half an hour, so each administration produces a discrete pulse.',
        },
        {
          title: 'More stable than native GRF (1-29)',
          description:
            'Four amino-acid substitutions make Mod GRF (1-29) more resistant to enzymatic breakdown than sermorelin, which is why it is often used as a research alternative.',
        },
        {
          title: 'Complements GH secretagogues',
          description:
            'Frequently studied alongside ghrelin-receptor agonists such as ipamorelin, which act through a separate pathway.',
        },
        {
          title: 'Downstream IGF-1 signalling',
          description:
            'Increased GH output is associated with raised IGF-1 in study settings, a common marker used to track response.',
        },
      ],
      dosageIntro:
        "Research protocols for CJC-1295 (No DAC) commonly reference small subcutaneous doses timed to create distinct GH pulses. Confirm concentration and route against the vendor's own COA before use.",
      route: 'Subcutaneous injection',
      exampleRange: '100 mcg per administration',
      frequency: '1–3 times daily in published protocols',
      timing: 'Often referenced on an empty stomach or before sleep, when natural GH pulses are largest.',
      evidence: [
        {
          title: 'GHRH analogue pharmacology',
          body: 'Mod GRF (1-29) is a modified version of the first 29 amino acids of growth-hormone-releasing hormone, the shortest fragment that keeps full receptor activity, engineered for greater resistance to enzymatic degradation.',
          link: null,
        },
        {
          title: 'DAC vs. No DAC half-life',
          body: 'Research on the DAC-modified form reports a half-life of several days through albumin binding, while the No DAC form acts briefly. This page covers the No DAC form only.',
          link: null,
        },
        {
          title: 'Combination studies with GHRPs',
          body: 'Studies combining GHRH analogues with GH-releasing peptides describe a larger GH response than either compound alone, reflecting their separate receptor targets.',
          link: null,
        },
      ],
      interactions: [
        {
          pair: 'Ipamorelin',
          note: 'Commonly paired in research; acts on the ghrelin receptor, a separate pathway from GHRH.',
        },
        {
          pair: 'GHRP-6',
          note: 'GH-releasing peptide studied alongside GHRH analogues; also associated with increased appetite signalling in research models.',
        },
        {
          pair: 'CJC-1295 (with DAC)',
          note: 'Same GHRH-receptor target with a much longer half-life; not typically combined with the No DAC form.',
        },
        {
          pair: 'Tesamorelin',
          note: 'Another GHRH analogue with an overlapping mechanism; generally studied separately rather than together.',
        },
      ],
      faq: [
        {
          question: 'What is the difference between CJC-1295 with and without DAC?',
          answer:
            'Both are GHRH analogues. The DAC version binds to albumin and stays active for days, while the No DAC version (Mod GRF 1-29) acts for a short time, producing distinct GH pulses.',
        },
        {
          question: 'Is CJC-1295 (No DAC) the same as Mod GRF (1-29)?',
          answer:
            'Yes. CJC-1295 without DAC is commonly sold as Modified GRF (1-29); the two names refer to the same peptide.',
        },
        {
          question: 'Why is it often listed with ipamorelin?',
          answer:
            'The two act on different receptors, GHRH and ghrelin respectively, so research protocols frequently study them together.',
        },
        {
          question: 'Is CJC-1295 (No DAC) for research use only?',
          answer: 'Yes. It is sold for laboratory research and is not approved for human or veterinary use.',
        },
      ],
    },
  },
};

function isEmpty(value: unknown): boolean {
  return value === null || (Array.isArray(value) && value.length === 0);
}

function fillResearch(real: ResearchSections, demo: Partial<ResearchSections>): ResearchSections {
  const pick = <K extends keyof ResearchSections>(key: K): ResearchSections[K] =>
    isEmpty(real[key]) ? (demo[key] ?? real[key]) : real[key];

  return {
    benefitsTitle: pick('benefitsTitle'),
    benefitsIntro: pick('benefitsIntro'),
    benefits: pick('benefits'),
    dosageTitle: pick('dosageTitle'),
    dosageIntro: pick('dosageIntro'),
    route: pick('route'),
    exampleRange: pick('exampleRange'),
    frequency: pick('frequency'),
    timing: pick('timing'),
    evidenceTitle: pick('evidenceTitle'),
    evidenceIntro: pick('evidenceIntro'),
    evidence: pick('evidence'),
    interactionsTitle: pick('interactionsTitle'),
    interactions: pick('interactions'),
    faq: pick('faq'),
  };
}

export function withDemoProductContent(product: Product): Product {
  if (process.env.NODE_ENV === 'production') return product;
  const demo = DEMO_CONTENT[product.slug];
  if (!demo) return product;

  return {
    ...product,
    forms: product.forms.length > 0 ? product.forms : demo.forms,
    intakeTypes: product.intakeTypes.length > 0 ? product.intakeTypes : demo.intakeTypes,
    purposePills: product.purposePills.length > 0 ? product.purposePills : demo.purposePills,
    research: fillResearch(product.research, demo.research),
  };
}
