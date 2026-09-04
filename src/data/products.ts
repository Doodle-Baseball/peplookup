import { productListSchema, type Product } from '@/lib/schema';

/**
 * Compound definitions. These are descriptive facts about the molecules, not
 * vendor claims, and carry no pricing. Prices live in the offers table and only
 * ever come from an observed vendor page.
 */
const seed: Product[] = [
  {
    slug: 'bpc-157',
    name: 'BPC-157',
    category: 'Healing',
    summary:
      'A synthetic peptide fragment studied in preclinical models for tendon, muscle and gastrointestinal tissue repair, and for anti-inflammatory activity.',
    aliases: ['Body Protection Compound 157', 'PL 14736'],
  },
  {
    slug: 'tb-500',
    name: 'TB-500',
    category: 'Healing',
    summary:
      'A synthetic version of the active region of thymosin beta-4, studied preclinically for cell migration and tissue repair.',
    aliases: ['Thymosin Beta-4 fragment'],
  },
  {
    slug: 'semaglutide',
    name: 'Semaglutide',
    category: 'GLP-1',
    summary: 'A GLP-1 receptor agonist peptide studied for metabolic and glycaemic research endpoints.',
    aliases: ['GLP-1'],
  },
  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'GLP-1',
    summary: 'A dual GIP and GLP-1 receptor agonist peptide used in metabolic research.',
    aliases: ['GIP/GLP-1'],
  },
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    category: 'GLP-1',
    summary: 'A triple GIP, GLP-1 and glucagon receptor agonist peptide under metabolic research.',
    aliases: ['GGG', 'Triple-G'],
  },
  {
    slug: 'epithalon',
    name: 'Epithalon',
    category: 'Longevity',
    summary: 'A synthetic tetrapeptide studied in relation to telomerase activity and circadian regulation.',
    aliases: ['Epitalon', 'AEDG'],
  },
  {
    slug: 'cjc-1295-no-dac',
    name: 'CJC-1295 (No DAC)',
    category: 'Growth',
    summary: 'A growth-hormone-releasing hormone analogue studied for pulsatile GH release in research models.',
    aliases: ['Mod GRF (1-29)'],
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    category: 'Metabolic',
    summary: 'A modified fragment of human growth hormone studied for lipolytic activity in research models.',
    aliases: ['hGH fragment 176-191'],
  },
];

export const products: readonly Product[] = productListSchema.parse(seed);
