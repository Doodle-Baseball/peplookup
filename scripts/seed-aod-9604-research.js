const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envPath = 'D:/Downloads/peplookup/peplookup-claude-new-session-y5xb4n/.env.local';

const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
}

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const description =
  'AOD-9604 is a modified fragment of human growth hormone (amino acids 176-191) engineered to isolate the fat-metabolizing region of the HGH molecule while removing the segment responsible for growth-promoting effects. It was originally developed as an anti-obesity candidate and is now studied mainly for its lipolytic (fat-breakdown) activity in preclinical and early-phase research.';

const research = {
  benefitsIntro:
    'Outcomes described across the published literature and ongoing study, not promised results. Read each as research context, not a guarantee.',
  benefits: [
    'Lipolytic activity on stored fat tissue',
    'No reported growth-promoting (IGF-1) effects',
    'Studied without significant impact on blood glucose',
    'Preclinical support for fat-metabolism research',
    'Generally well tolerated across early trial data',
  ],
  dosageIntro:
    "Research protocols for AOD-9604 commonly reference subcutaneous administration in preclinical and early-phase studies. Confirm concentration and route against the vendor's own COA before use.",
  route: 'Subcutaneous injection',
  exampleRange: '250\u2013500 mcg',
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
  faq: [],
};

(async () => {
  const { data: existing, error: readError } = await client
    .from('products')
    .select('slug')
    .eq('slug', 'aod-9604')
    .maybeSingle();

  if (readError) {
    console.error('Read failed:', readError.message);
    process.exit(1);
  }

  if (!existing) {
    console.error('No products row with slug "aod-9604" found. Nothing updated.');
    process.exit(1);
  }

  const { error } = await client
    .from('products')
    .update({ description, research })
    .eq('slug', 'aod-9604');

  if (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }

  console.log('Updated aod-9604 with demo description + research content.');
})();
