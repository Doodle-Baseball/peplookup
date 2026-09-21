export type GuideIcon = 'document' | 'flask' | 'shield' | 'bolt' | 'badge' | 'globe';
export type GuideAccent = 'cat-1' | 'cat-2' | 'cat-3' | 'cat-4' | 'cat-5';

export interface GuideSection {
  heading: string;
  body: readonly string[];
}

export interface Guide {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  icon: GuideIcon;
  accent: GuideAccent;
  /**
   * Cover photo URL. When absent the generated icon + colour art is used, so a
   * guide always has a cover without anyone sourcing an image for it.
   */
  coverImageUrl?: string | null;
  readMinutes: number;
  /** ISO date; kept as a plain string so this file has no server-only imports. */
  publishedAt: string;
  sections: readonly GuideSection[];
  /** One of the site's own calculators/checkers this guide points to, where relevant. */
  relatedTool?: { label: string; href: string };
}

/**
 * Editorial "how things work" content, general process and terminology, never
 * dosing recommendations or purity/safety claims about a specific product.
 * Keep new entries to that same register (see CLAUDE.md's YMYL rules).
 */
export const guides: readonly Guide[] = [
  {
    slug: 'how-to-read-a-coa',
    title: 'How to Read a Certificate of Analysis (COA)',
    category: 'Verification',
    excerpt:
      'A COA is a lab’s report on what is actually in a vial. Here is what each section means and what questions to ask before trusting one.',
    icon: 'document',
    accent: 'cat-2',
    readMinutes: 6,
    publishedAt: '2026-06-02',
    relatedTool: { label: 'Try the COA Reader', href: '/tools/coa-reader' },
    sections: [
      {
        heading: 'What a COA actually certifies',
        body: [
          'A Certificate of Analysis is a report issued by a testing lab describing what it found when it examined a specific batch, usually identity (is this the compound it claims to be), purity, and sometimes residual solvents or heavy metals.',
          'A COA is only as reliable as the lab that produced it and the batch it was actually tested against. It says nothing by itself about how the product was stored or handled after that test.',
        ],
      },
      {
        heading: 'The fields worth checking first',
        body: [
          'Batch or lot number: this should match the number printed on the vial or box you received. A COA for a different batch tells you nothing about the vial in front of you.',
          'Test date and lab name: an independent third-party lab carries more weight than an in-house report, and a report that is years old may predate changes in the supplier’s process.',
          'Method used: identity is commonly checked by mass spectrometry (MS) or HPLC; purity is usually reported as a percentage from HPLC. Reports that only state a percentage with no method listed are harder to verify.',
        ],
      },
      {
        heading: 'Questions worth asking a supplier',
        body: [
          'Can you match this COA to the batch number on my order? Is the testing lab independent of the manufacturer? Is a newer COA available if this one is more than a few months old?',
          'A supplier willing to answer these directly, and to link a COA per batch rather than one generic PDF for every order, is giving you more to verify against. Treat that as a starting point for your own due diligence, not a guarantee.',
        ],
      },
    ],
  },
  {
    slug: 'understanding-cost-per-mg',
    title: 'Understanding Cost Per Mg (and Why Sticker Price Lies)',
    category: 'Pricing',
    excerpt:
      'Two vials at the same sticker price can cost twice as much per mg once you account for size and multipacks. Here is the math that actually matters.',
    icon: 'flask',
    accent: 'cat-1',
    readMinutes: 5,
    publishedAt: '2026-05-18',
    relatedTool: { label: 'Try the Price per Mg calculator', href: '/tools/price-per-mg' },
    sections: [
      {
        heading: 'Why the list price alone is meaningless',
        body: [
          'A $60 vial and a $110 vial look like an easy comparison until you notice one holds 5 mg and the other holds 15 mg. Priced per mg, the "cheaper" vial is actually the worse deal.',
          'The same trap applies to multipacks: three vials for $150 is a different number per mg than one vial for $55, even though the sticker price per pack looks similar.',
        ],
      },
      {
        heading: 'The formula',
        body: [
          'Cost per mg = total price paid ÷ (mg per vial × number of vials in the pack). Run the numbers at full precision and round only for display. Rounding first can make two genuinely different prices look identical, or vice versa.',
          'If a listing shows a discounted price alongside a list price, use the price you would actually pay at checkout, not the crossed-out one.',
        ],
      },
      {
        heading: 'What this site does with that number',
        body: [
          'Every price shown here is normalised to cost per mg so different vial sizes and multipacks are directly comparable, and out-of-stock listings are filtered out before ranking rather than being left in as false "best price" results.',
        ],
      },
    ],
  },
  {
    slug: 'peptide-storage-basics',
    title: 'Storage Basics: Temperature, Light and Shelf Life',
    category: 'Handling',
    excerpt:
      'Lyophilized and reconstituted material have very different storage needs. A few general principles explain why suppliers give different guidance for each.',
    icon: 'shield',
    accent: 'cat-4',
    readMinutes: 4,
    publishedAt: '2026-04-27',
    sections: [
      {
        heading: 'Lyophilized (freeze-dried) vs. reconstituted',
        body: [
          'Freeze-dried material in a sealed vial is generally the most stable form, since there is no liquid for degradation reactions to occur in. Once a diluent is added, the material behaves very differently and typically needs colder storage and a shorter usable window.',
          'This is a general pattern, not a substitute for the specific storage instructions on your supplier’s COA or product page; those should always take priority for a given batch.',
        ],
      },
      {
        heading: 'The three usual suspects for degradation',
        body: [
          'Heat accelerates most degradation reactions, which is why cold-chain shipping and refrigerated or frozen storage are common recommendations.',
          'Light, particularly UV, can break down some compounds over time, a reason many vials ship in amber packaging or a light-blocking outer box.',
          'Repeated freeze-thaw cycles and agitation can also stress reconstituted solutions, which is part of why single-use aliquots are commonly recommended over drawing repeatedly from one vial.',
        ],
      },
      {
        heading: 'What to actually check',
        body: [
          'Look for a stated shelf life both before and after reconstitution, a storage temperature range, and whether the supplier recommends protecting the vial from light. If any of these are missing, it is a reasonable question to ask before you buy.',
        ],
      },
    ],
  },
  {
    slug: 'reconstitution-basics',
    title: 'Reconstitution Basics: Diluent, Concentration and Syringe Math',
    category: 'Handling',
    excerpt:
      'Reconstitution is arithmetic, not guesswork: how much diluent you add sets the concentration, and the concentration sets what a syringe marking represents.',
    icon: 'bolt',
    accent: 'cat-3',
    readMinutes: 5,
    publishedAt: '2026-04-05',
    relatedTool: { label: 'Try the Reconstitution calculator', href: '/tools/calculator' },
    sections: [
      {
        heading: 'The relationship between diluent and concentration',
        body: [
          'Reconstitution means adding a liquid (commonly bacteriostatic or sterile water) to a lyophilized vial. The amount of diluent you add, together with the mg stated on the vial, sets the resulting concentration, more diluent means a lower concentration for the same total amount of material.',
          'That concentration is what turns a volume on a syringe into an amount of material, which is why the same syringe marking means something different from one reconstitution to the next.',
        ],
      },
      {
        heading: 'Reading a syringe accurately',
        body: [
          'Insulin syringes are commonly marked in units (U-100), where the marks correspond to volume, not mg directly, converting a unit marking into mg requires knowing the concentration first.',
          'Air bubbles and a needle that isn’t fully seated are two of the most common sources of a measurement being off from what the markings suggest.',
        ],
      },
      {
        heading: 'Why this is a calculation, not a guess',
        body: [
          'Because the same vial can be reconstituted to many different concentrations depending on how much diluent is used, there is no single "right" syringe reading that applies universally, it always depends on the specific dilution being used. A calculator that takes vial size, diluent volume and target amount as inputs removes the manual arithmetic, but the numbers you put in still have to be accurate.',
        ],
      },
    ],
  },
  {
    slug: 'choosing-a-research-supplier',
    title: 'Choosing a Research Supplier: A Due-Diligence Checklist',
    category: 'Suppliers',
    excerpt:
      'Price is one input, not the whole decision. Here is what else is worth checking before you place an order with a new supplier.',
    icon: 'badge',
    accent: 'cat-5',
    readMinutes: 6,
    publishedAt: '2026-03-14',
    relatedTool: { label: 'Browse verified suppliers', href: '/suppliers' },
    sections: [
      {
        heading: 'Start with verification, not price',
        body: [
          'A batch-specific, independently tested COA is a stronger signal than a low price. A supplier that publishes COAs openly and links them per batch is giving you more to check than one that emails a PDF on request, or not at all.',
        ],
      },
      {
        heading: 'Shipping and policy transparency',
        body: [
          'Clear shipping timelines, a stated shipping cost (or an honestly-labelled "unknown" rather than a hidden fee revealed at checkout), and a published returns or refund policy are all things a legitimate supplier should be willing to state plainly.',
        ],
      },
      {
        heading: 'Consistency over time',
        body: [
          'A single good experience does not prove reliability, and neither does a single bad one. Where available, look at how a supplier’s pricing, stock status and lab reports have looked over time rather than a single snapshot.',
        ],
      },
      {
        heading: 'Red flags worth taking seriously',
        body: [
          'Purity or identity claims with no COA to back them, prices that sit far outside every other listing for the same product, and an unwillingness to answer direct questions about testing are all reasons to slow down before ordering.',
        ],
      },
    ],
  },
  {
    slug: 'what-research-use-only-means',
    title: 'Research Use Only: What That Label Actually Means',
    category: 'Compliance',
    excerpt:
      'This label shows up on every listing this site tracks. Here is what it signals, and what it does not.',
    icon: 'globe',
    accent: 'cat-2',
    readMinutes: 4,
    publishedAt: '2026-02-20',
    sections: [
      {
        heading: 'What the label signals',
        body: [
          '"Research use only" is a labelling and marketing designation. Products carrying it are represented as intended for laboratory research, not for human or animal consumption, and are not products the FDA has evaluated statements about, nor products intended to diagnose, treat, cure or prevent disease.',
        ],
      },
      {
        heading: 'What it does not tell you',
        body: [
          'The label is not a purity or safety guarantee; that is what a COA is for, and even a COA only covers what was tested at a point in time. It is also not a statement about the legal status of a specific compound in your jurisdiction, which is the buyer’s own responsibility to check.',
        ],
      },
      {
        heading: 'Where this site fits in',
        body: [
          'This platform is a price-comparison and information tool: it aggregates publicly listed pricing and supplier information, and every transaction happens directly between a buyer and a third-party supplier. See the full disclaimer for the complete terms this posture is built on.',
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
