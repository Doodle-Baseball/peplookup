import { productListSchema, productSchema, type Product } from '@/lib/schema';
import type { z } from 'zod';
import { EMPTY_RESEARCH } from '@/lib/compound-content';

/**
 * Compound definitions. These are descriptive facts about the molecules, not
 * vendor claims, and carry no pricing. Prices live in the offers table and only
 * ever come from an observed vendor page.
 */

const DEFAULTS = {
  forms: [] as Product['forms'],
  intakeTypes: [] as Product['intakeTypes'],
  typicalDose: null,
  cycle: null,
  storage: null,
  images: [] as Product['images'],
  isCompound: true,
  description: null,
  purposePills: [] as Product['purposePills'],
  // No editorial research content authored yet for the seed compounds.
  research: EMPTY_RESEARCH,
  primarySupplierSlug: null,
  coaUrl: null,
};

const seed: z.input<typeof productSchema>[] = [
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    category: 'Healing',
    summary:
      'A synthetic peptide fragment studied in preclinical models for tendon, muscle and gastrointestinal tissue repair, and for anti-inflammatory activity.',
    aliases: ['Body Protection Compound 157', 'PL 14736'],
    ...DEFAULTS,
  },
  {
    slug: 'tb-500',
    name: 'TB-500',
    category: 'Healing',
    summary:
      'A synthetic version of the active region of thymosin beta-4, studied preclinically for cell migration and tissue repair.',
    aliases: ['Thymosin Beta-4 fragment'],
    ...DEFAULTS,
  },
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    category: 'GLP-1',
    summary: 'A GLP-1 receptor agonist peptide studied for metabolic and glycaemic research endpoints.',
    aliases: ['GLP-1'],
    ...DEFAULTS,
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'GLP-1',
    summary: 'A dual GIP and GLP-1 receptor agonist peptide used in metabolic research.',
    aliases: ['GIP/GLP-1'],
    ...DEFAULTS,
  },
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    category: 'GLP-1',
    summary: 'A triple GIP, GLP-1 and glucagon receptor agonist peptide under metabolic research.',
    aliases: ['GGG', 'Triple-G'],
    ...DEFAULTS,
  },
  {
    slug: 'epithalon',
    name: 'Epithalon',
    category: 'Longevity',
    summary: 'A synthetic tetrapeptide studied in relation to telomerase activity and circadian regulation.',
    aliases: ['Epitalon', 'AEDG'],
    ...DEFAULTS,
  },
  {
    slug: 'cjc-1295-no-dac',
    name: 'CJC-1295 (No DAC)',
    category: 'Growth',
    summary: 'A growth-hormone-releasing hormone analogue studied for pulsatile GH release in research models.',
    aliases: ['Mod GRF (1-29)'],
    ...DEFAULTS,
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    category: 'Metabolic',
    summary: 'A modified fragment of human growth hormone studied for lipolytic activity in research models.',
    aliases: ['hGH fragment 176-191'],
    ...DEFAULTS,
    description:
      'AOD-9604 is a modified fragment of human growth hormone (amino acids 176-191) engineered to isolate the fat-metabolizing region of the HGH molecule while removing the segment responsible for growth-promoting effects. It was originally developed as an anti-obesity candidate and is now studied mainly for its lipolytic (fat-breakdown) activity in preclinical and early-phase research.',
    research: {
      ...EMPTY_RESEARCH,
      benefitsIntro:
        'Outcomes described across the published literature and ongoing study, not promised results. Read each as research context, not a guarantee.',
      benefits: [
        'Lipolytic activity on stored fat tissue',
        'No reported growth-promoting (IGF-1) effects',
        'Studied without significant impact on blood glucose',
        'Preclinical support for fat-metabolism research',
        'Generally well tolerated across early trial data',
      ].map((title) => ({ title, description: null })),
      dosageIntro:
        "Research protocols for AOD-9604 commonly reference subcutaneous administration in preclinical and early-phase studies. Confirm concentration and route against the vendor's own COA before use.",
      route: 'Subcutaneous injection',
      exampleRange: '250–500 mcg',
      frequency: 'Once daily',
      timing:
        'Typically administered in the morning on an empty stomach, mirroring the fasting-state protocols used in early obesity research.',
      evidence: [
        {
          title: 'Phase II obesity trials (2000s)',
          body: 'Early-phase human trials evaluated AOD-9604 for weight-loss research endpoints. Results versus placebo were mixed and did not support continued development as a standalone anti-obesity therapeutic.',
          link: 'http://localhost:3001/products',
        },
        {
          title: 'Preclinical lipolysis studies',
          body: 'Animal and in-vitro models describe fragment-specific activity on lipid metabolism pathways, isolated from the growth-promoting region of the full-length HGH molecule.',
          link: 'http://localhost:3001/products',
        },
        {
          title: 'Safety and tolerability data',
          body: 'Reported research indicates AOD-9604 was generally well tolerated in trial settings, without the insulin resistance or blood glucose effects associated with unmodified HGH.',
          link: 'http://localhost:3001/products',
        },
      ],
      interactions: [
        {
          pair: 'CJC-1295',
          note: 'Commonly referenced together in metabolic and growth research contexts. No known negative interaction reported; distinct primary targets (GH-release vs. lipolytic fragment).',
        },
        {
          pair: 'Ipamorelin',
          note: 'No known negative interaction reported. Different mechanisms of action and receptor targets.',
        },
        {
          pair: 'Semaglutide',
          note: 'No known negative interaction reported. Different receptor pathways (GLP-1 vs. HGH fragment) with overlapping metabolic research interest.',
        },
        {
          pair: 'Tesamorelin',
          note: 'Overlapping interest in metabolic and fat-tissue research; no documented adverse interaction in the published literature.',
        },
      ],
    },
  },
];

export const products: readonly Product[] = productListSchema.parse(seed);
