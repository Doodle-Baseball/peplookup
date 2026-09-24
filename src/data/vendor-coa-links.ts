import type { Offer } from '@/lib/schema';

/**
 * COA documents vendors publish for their own listings, supplied alongside
 * each listing's price and product page. Keyed by vendor, compound, form and
 * size (micrograms), so a vial and a spray of the same compound and size, or
 * two sizes of one compound, each keep their own link.
 *
 * Only fills `coaUrl` where the offer has none stored, so a link saved in the
 * database (`offers.coa_url`, supabase/migrations/0007_offers_coa_url.sql)
 * always wins over this list.
 */
const VERTEX_UPLOADS = 'https://vertexpeptideslab.org/wp-content/uploads/';
const PURATEK_UPLOADS = 'https://puratekpeptides.com/wp-content/uploads/';
const ELITE_UPLOADS = 'https://eliteedgebiotech.com/wp-content/uploads/';
const AMERICAN_PEPTIDES_DOCS = 'https://www.americanpeptides.us/docs/';
const SYNTHESIS_FILES =
  'https://s3.us-east-1.amazonaws.com/medusajs.cloud-data-prod-use1-20241127093450366600000001/ef0525899c1be447f2e/';
const PRIME_COAS = 'https://primepepsolutions.com/static/uploads/coas/';
const PEPVIDA_COAS = 'https://pepvida-coas.pages.dev/';
const PEPVIDA_UPLOADS = 'https://pepvida.com/wp-content/uploads/';
const VANTAGE_UPLOADS = 'https://vantageaminos.co/wp-content/uploads/';
const JANOSHIK_TESTS = 'https://verify.janoshik.com/tests/';
const AMEANO_UPLOADS = 'https://ameanopeptides.com/wp-content/uploads/';
const ELEVATE_SITE = 'https://elevateresearchco.com';
const DYNOTIDES_COAS = 'https://dynotides.shop/wp-content/plugins/dynotides-catalog/app/certificates/previews/';
const LA_PEPTIDES_UPLOADS = 'https://lapeptides.net/wp-content/uploads/';
const LA_PEPTIDES_LAB_TEST = 'https://lapeptides.net/lab-test/';
const TRUSTED_PEPS_UPLOADS = 'https://trustedpeps.us/wp-content/uploads/';
const AXIS_UPLOADS = 'https://axispeptidelabs.com/wp-content/uploads/';
const RIVN_UPLOADS = 'https://rivnresearch.com/wp-content/uploads/';
const PRISTINE_UPLOADS = 'https://pristineaminos.com/wp-content/uploads/';
const CIELO_UPLOADS = 'https://cielocrew.com/wp-content/uploads/';
const ARES_COA = 'https://aresresearchlab.com/coa?slug=';
const NURA_UPLOADS = 'https://nurapeptide.com/wp-content/uploads/';
const APEX_CMS = 'https://cms.apexpeptideslab.com/wp-content/uploads/';
const REJUVEN8_UPLOADS = 'https://rejuven8peptides.com/wp-content/uploads/';
const REJUVEN8_REF = '?aff=peplookup';
const AVERIX_UPLOADS = 'https://averixlabs.com/wp-content/uploads/';
const AVERIX_REF = '?utm_source=affiliate_marketing&code=PRODUCTS';
const MSAMINO_COAS = 'https://jgokk5cfxl4fj7ny.public.blob.vercel-storage.com/coas/';
const MSAMINO_REF = '?ref=W9QVLNLY';
const QURESHI_IMAGES = 'https://qureshilabs.com/wp-content/uploads/';
const QURESHI_REF = '?utm_source=partner&code=PEPLOOKUP';
const AS_COAS = 'https://aminoscience.io/coas/';
const AS_DPL1 = 'dpl=dpl_GkgVG1GTAC1bj5EqrgCcoqEV8o5Y&ref=PRODUCTS';
const AS_DPL2 = 'dpl=dpl_BLWgjHPNvUoAEk6E1FRwgAcDUXyd&ref=PRODUCTS';
const AS_DPL3 = 'dpl=dpl_qVNmsBMNTBaw1buEq2w7a4U7iF6L&ref=PRODUCTS';
const AS_DPL4 = 'dpl=dpl_GmkY1o7fe2XEQkbVn7aLGwgNwhw3&ref=PRODUCTS';

const COA_LINKS: Readonly<Record<string, string>> = {
  // Pure Amino
  'pure-amino-2/bpc-157/vial/10000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/bpc-157-10mg-PA25080201.png',
  'pure-amino-2/tb-500/vial/10000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/tb-500-10mg-PA25060201.png',
  'pure-amino-2/ghk-cu/vial/50000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/ghk-cu-50mg-PA25020101.png',
  'pure-amino-2/ghk-cu/vial/100000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/ghk-cu-100mg-PA25050102.png',
  'pure-amino-2/retatrutide/vial/10000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/glp-3-10mg-PA26011401.png',
  'pure-amino-2/retatrutide/vial/30000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/glp-3-30mg-PA26021502.png',
  'pure-amino-2/mots-c/vial/10000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/mots-c-10mg-PA25030201.png',
  'pure-amino-2/nad/vial/500000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/nad-500mg-PA-NAD-002.pdf',
  'pure-amino-2/tesamorelin/vial/10000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/tesamorelin-10mg-PA-TES-002.pdf',
  'pure-amino-2/semax/vial/10000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/semax-10mg-PA25070501.png',
  'pure-amino-2/pt-141/vial/10000':
    'https://www.pureamino.com/wp-content/themes/pureamino/assets/coa/pt-141-10mg-PA25021602.png',

  // Vortex Research
  // The vendor's general COA page rather than a certificate for this one listing; it is the link supplied for it.
  'vortex-research-2/bpc-157/vial/10000': 'https://vortexresearch.net/coa/',
  'vortex-research-2/bpc-157-tb-500/vial/10000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/BPC-157_TB-500_PS07-BCTB20_Summary.png',
  'vortex-research-2/ghk-cu/vial/50000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/GHK-Cu_PS07-GHK100_Summary.png',
  'vortex-research-2/tesamorelin/vial/10000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/TSM_PS07-TSM10_Summary.png',
  'vortex-research-2/nad/vial/500000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/NAD_PS07-NAD500_Summary.png',
  'vortex-research-2/mots-c/vial/10000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/MOTS-C_PS07-MS40_Summary.png',
  'vortex-research-2/selank/vial/10000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/Selank_PS07-SK10_Summary.png',
  'vortex-research-2/5-amino-1mq/vial/10000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/5-Amino-1MQ_PS07-5AM50_Summary-1.png',
  'vortex-research-2/melanotan-2/vial/10000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/Melanotan_II_PS07-MT210_Summary.png',
  // The vendor lists its MT-2 certificate for the spray as well.
  'vortex-research-2/melanotan-2/spray/10000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/Melanotan_II_PS07-MT210_Summary.png',
  'vortex-research-2/ipamorelin-cjc-1295-no-dac/vial/20000':
    'https://vortexresearch.net/wp-content/uploads/2026/08/CJC-1295_No_DAC_Ipamorelin_PS07-CJIP10_Summary.png',

  // Heez Research
  // The vendor lists one certificate per compound for both BPC-157 sizes and both GHK-Cu sizes.
  'heez-research-2/bpc-157/vial/5000': 'https://heezresearch.com/coa/bpc-157-coa.webp',
  'heez-research-2/bpc-157/vial/10000': 'https://heezresearch.com/coa/bpc-157-coa.webp',
  'heez-research-2/ghk-cu/vial/50000': 'https://heezresearch.com/coa/Chromate_Job_36488.webp',
  'heez-research-2/ghk-cu/vial/100000': 'https://heezresearch.com/coa/Chromate_Job_36488.webp',
  'heez-research-2/retatrutide/vial/10000': 'https://heezresearch.com/coa/Chromate_Job_36277.webp',
  'heez-research-2/retatrutide/vial/20000': 'https://heezresearch.com/coa/retatrutide-20mg-coa.webp',
  'heez-research-2/tesamorelin/vial/10000': 'https://heezresearch.com/coa/tesamorelin-coa.webp',
  'heez-research-2/mots-c/vial/10000': 'https://heezresearch.com/coa/mots-c-coa.webp',
  'heez-research-2/pt-141/vial/10000': 'https://heezresearch.com/coa/pt-141-coa.webp',
  'heez-research-2/ss-31-elamipretide/vial/10000': 'https://heezresearch.com/coa/ss-31-coa.webp',
  'heez-research-2/melanotan-2/vial/10000': 'https://heezresearch.com/coa/Chromate_Job_37509.webp',
  'heez-research-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': 'https://heezresearch.com/coa/klow-coa.webp',
  'heez-research-2/wolverine/vial/10000': 'https://heezresearch.com/coa/wolverine-coa.webp',

  // Vertex Peptides Lab
  // Where the vendor publishes one certificate for several sizes of a compound, every size links to it.
  'vertex-labs-2/retatrutide/vial/10000': `${VERTEX_UPLOADS}2026/07/GLP3RT10_RT0000033_01.pdf`,
  'vertex-labs-2/retatrutide/vial/15000': `${VERTEX_UPLOADS}2026/08/GLP3RT_RT0000040_15MG.pdf`,
  'vertex-labs-2/retatrutide/vial/20000': `${VERTEX_UPLOADS}2026/04/GLP3RT20.pdf`,
  'vertex-labs-2/retatrutide/vial/30000': `${VERTEX_UPLOADS}2026/08/GLP3RT_RT0000041_30MG.pdf`,
  'vertex-labs-2/retatrutide/vial/60000': `${VERTEX_UPLOADS}2026/08/GLP3RT_RT0000039_60MG.pdf`,
  'vertex-labs-2/semaglutide/vial/10000': `${VERTEX_UPLOADS}2026/04/GLP-1-SM_SM0000038.pdf`,
  'vertex-labs-2/semaglutide/vial/20000': `${VERTEX_UPLOADS}2026/04/GLP-1-SM_SM0000038.pdf`,
  'vertex-labs-2/semaglutide/vial/30000': `${VERTEX_UPLOADS}2026/04/GLP-1-SM_SM0000038.pdf`,
  'vertex-labs-2/tirzepatide/vial/20000': `${VERTEX_UPLOADS}2026/08/GLP2TRZ_TZ0000033_30MG.pdf`,
  'vertex-labs-2/tirzepatide/vial/30000': `${VERTEX_UPLOADS}2026/08/GLP2TRZ_TZ0000033_30MG.pdf`,
  'vertex-labs-2/tirzepatide/vial/40000': `${VERTEX_UPLOADS}2026/08/GLP2TRZ_TZ0000033_30MG.pdf`,
  'vertex-labs-2/tirzepatide/vial/60000': `${VERTEX_UPLOADS}2026/08/GLP2TRZ_TZ0000033_30MG.pdf`,
  'vertex-labs-2/bpc-157/vial/5000': `${VERTEX_UPLOADS}2026/04/BPC-157_BP0000046.pdf`,
  'vertex-labs-2/bpc-157/vial/10000': `${VERTEX_UPLOADS}2026/04/BPC-157_BP0000046.pdf`,
  'vertex-labs-2/tb-500/vial/5000': `${VERTEX_UPLOADS}2026/04/TB-5000_TB0000030.pdf`,
  'vertex-labs-2/tb-500/vial/10000': `${VERTEX_UPLOADS}2026/04/TB-5000_TB0000030.pdf`,
  'vertex-labs-2/tesamorelin/vial/5000': `${VERTEX_UPLOADS}2026/04/TESA10MG_0000043.pdf`,
  'vertex-labs-2/tesamorelin/vial/10000': `${VERTEX_UPLOADS}2026/04/TESA10MG_0000043.pdf`,
  'vertex-labs-2/mots-c/vial/20000': `${VERTEX_UPLOADS}2026/04/MOTSC_MC0000028.pdf`,
  'vertex-labs-2/mots-c/vial/40000': `${VERTEX_UPLOADS}2026/04/MOTSC_MC0000028.pdf`,
  'vertex-labs-2/nad/vial/500000': `${VERTEX_UPLOADS}2026/04/NAD_NAD.00000030.pdf`,
  'vertex-labs-2/nad/vial/1000000': `${VERTEX_UPLOADS}2026/04/NAD_NAD.00000030.pdf`,
  'vertex-labs-2/glutathione/vial/600000': `${VERTEX_UPLOADS}2026/04/Gluta_GL000000038.pdf`,
  'vertex-labs-2/glutathione/vial/1500000': `${VERTEX_UPLOADS}2026/04/Gluta_GL000000038.pdf`,
  'vertex-labs-2/ghk-cu/vial/100000': `${VERTEX_UPLOADS}2026/04/GHK-Cu_GH0000023.pdf`,
  'vertex-labs-2/ipamorelin/vial/10000': `${VERTEX_UPLOADS}2026/04/IPA_IP0000030.pdf`,
  'vertex-labs-2/semax/vial/10000': `${VERTEX_UPLOADS}2026/04/SEMAX_SX0000028.pdf`,
  'vertex-labs-2/selank/vial/10000': `${VERTEX_UPLOADS}2026/04/Selank_SK0000025.pdf`,
  'vertex-labs-2/5-amino-1mq/vial/10000': `${VERTEX_UPLOADS}2026/04/5-amino-1mq_AM0000042.pdf`,
  'vertex-labs-2/dsip/vial/5000': `${VERTEX_UPLOADS}2026/09/DP0000019.pdf`,
  'vertex-labs-2/cjc-1295-no-dac/vial/5000': `${VERTEX_UPLOADS}2026/06/CJND000043.pdf`,
  'vertex-labs-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${VERTEX_UPLOADS}2026/04/CJC-IPA_CJIP000012.pdf`,
  'vertex-labs-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${VERTEX_UPLOADS}2026/04/GLOW_GW0000015.pdf`,
  'vertex-labs-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${VERTEX_UPLOADS}2026/07/KLOW_KL0000080_01.pdf`,
  'vertex-labs-2/wolverine/vial/10000': `${VERTEX_UPLOADS}2026/04/Wolverin_W00000015.pdf`,
  'vertex-labs-2/bacteriostatic-water/vial/10000': `${VERTEX_UPLOADS}2026/07/BW000000047_10_01.pdf`,

  // Puratek Peptides
  // Where the vendor publishes one certificate for several sizes of a compound, every size links to it.
  'puratek-peptides-2/bpc-157/vial/10000': `${PURATEK_UPLOADS}2026/06/bpc-157-batch-5-1-724x1024.png`,
  'puratek-peptides-2/tb-500/vial/10000': `${PURATEK_UPLOADS}2026/07/tb-500-batch-4-1-724x1024.png`,
  'puratek-peptides-2/bpc-157-tb-500/vial/20000': `${PURATEK_UPLOADS}2026/09/bpctb-batch-6-1-724x1024.png`,
  'puratek-peptides-2/ghk-cu/vial/50000': `${PURATEK_UPLOADS}2026/06/ghk-50-batch-2-1-724x1024.png`,
  'puratek-peptides-2/ghk-cu/vial/100000': `${PURATEK_UPLOADS}2026/06/ghk-50-batch-2-1-724x1024.png`,
  'puratek-peptides-2/retatrutide/vial/10000': `${PURATEK_UPLOADS}2026/07/pur3r-30-batch-7-1-724x1024.png`,
  'puratek-peptides-2/retatrutide/vial/20000': `${PURATEK_UPLOADS}2026/07/pur3r-30-batch-7-1-724x1024.png`,
  'puratek-peptides-2/retatrutide/vial/30000': `${PURATEK_UPLOADS}2026/07/pur3r-30-batch-7-1-724x1024.png`,
  'puratek-peptides-2/tirzepatide/vial/15000': `${PURATEK_UPLOADS}2026/06/pur2t-30-batch-4-1-724x1024.png`,
  'puratek-peptides-2/tirzepatide/vial/30000': `${PURATEK_UPLOADS}2026/06/pur2t-30-batch-4-1-724x1024.png`,
  'puratek-peptides-2/tirzepatide/vial/60000': `${PURATEK_UPLOADS}2026/06/pur2t-30-batch-4-1-724x1024.png`,
  'puratek-peptides-2/semaglutide/vial/10000': `${PURATEK_UPLOADS}2026/01/GLP-1s-5mg-791x1024.webp`,
  'puratek-peptides-2/cagrilintide/vial/5000': `${PURATEK_UPLOADS}2026/06/cagrilintide-5-batch-3-1-724x1024.png`,
  'puratek-peptides-2/cagrilintide/vial/10000': `${PURATEK_UPLOADS}2026/06/cagrilintide-5-batch-3-1-724x1024.png`,
  'puratek-peptides-2/ipamorelin/vial/10000': `${PURATEK_UPLOADS}2026/08/Ipamorelin-batch-3-1-724x1024.png`,
  'puratek-peptides-2/tesamorelin/vial/10000': `${PURATEK_UPLOADS}2026/05/TESA-10-BATCH-5-1-791x1024.png`,
  'puratek-peptides-2/tesamorelin/vial/20000': `${PURATEK_UPLOADS}2026/05/TESA-10-BATCH-5-1-791x1024.png`,
  'puratek-peptides-2/nad/vial/500000': `${PURATEK_UPLOADS}2026/07/nad-500-batch-3-1-724x1024.png`,
  'puratek-peptides-2/nad/vial/1000000': `${PURATEK_UPLOADS}2026/07/nad-500-batch-3-1-724x1024.png`,
  'puratek-peptides-2/epitalon/vial/10000': `${PURATEK_UPLOADS}2026/04/EPITHALON-BATCH-2-1-791x1024.png`,
  'puratek-peptides-2/semax/vial/10000': `${PURATEK_UPLOADS}2026/06/semax-batch-4-1-724x1024.png`,
  'puratek-peptides-2/selank/vial/10000': `${PURATEK_UPLOADS}2026/07/selank-batch-4-1-724x1024.png`,
  'puratek-peptides-2/pt-141/vial/10000': `${PURATEK_UPLOADS}2026/04/PT-141-10MG-BATCH-1-1-791x1024.png`,
  'puratek-peptides-2/5-amino-1mq/vial/10000': `${PURATEK_UPLOADS}2026/07/5-amino-10mg-batch-5-1-724x1024.png`,
  'puratek-peptides-2/5-amino-1mq/vial/50000': `${PURATEK_UPLOADS}2026/07/5-amino-10mg-batch-5-1-724x1024.png`,
  'puratek-peptides-2/ss-31-elamipretide/vial/30000': `${PURATEK_UPLOADS}2026/08/PUR31-30-BATCH-5-1-724x1024.png`,
  'puratek-peptides-2/dsip/vial/10000': `${PURATEK_UPLOADS}2026/07/dsip-batch-2-1-724x1024.png`,
  'puratek-peptides-2/glutathione/vial/1500000': `${PURATEK_UPLOADS}2026/07/gluta-batch-2-1-724x1024.png`,
  'puratek-peptides-2/melanotan-i/vial/10000': `${PURATEK_UPLOADS}2026/07/melanotan-1-batch-4-1-724x1024.png`,
  'puratek-peptides-2/melanotan-2/vial/10000': `${PURATEK_UPLOADS}2026/05/mt2-batch-3-1-1-724x1024.png`,
  'puratek-peptides-2/cjc-1295-no-dac/vial/10000': `${PURATEK_UPLOADS}2026/07/Cjc-no-dac-batch-2-1-724x1024.png`,
  'puratek-peptides-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${PURATEK_UPLOADS}2026/08/cjcipa-1010-batch-3-1-724x1024.png`,
  'puratek-peptides-2/ipamorelin-cjc-1295-no-dac/vial/20000': `${PURATEK_UPLOADS}2026/08/cjcipa-1010-batch-3-1-724x1024.png`,
  'puratek-peptides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${PURATEK_UPLOADS}2026/06/glow-batch-2-1-724x1024.png`,
  'puratek-peptides-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${PURATEK_UPLOADS}2026/08/KLOW-BATCH-5-1-724x1024.png`,

  // Elite Edge Biotech
  // Where the vendor publishes one certificate for several sizes of a compound, every size links to it.
  'elite-edge-biotech-2/bpc-157/vial/5000': `${ELITE_UPLOADS}2026/05/BPC-157-5mg-01-scaled.webp`,
  'elite-edge-biotech-2/bpc-157/vial/10000': `${ELITE_UPLOADS}2026/05/BPC-157-5mg-01-scaled.webp`,
  'elite-edge-biotech-2/tb-500/vial/10000': `${ELITE_UPLOADS}2026/06/COA_Thymosin_beta4_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/ghk-cu/vial/50000': `${ELITE_UPLOADS}2026/06/COA_GHK-Cu_50mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/ghk-cu/vial/100000': `${ELITE_UPLOADS}2026/06/COA_GHK-Cu_50mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/retatrutide/vial/10000': `${ELITE_UPLOADS}2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/retatrutide/vial/20000': `${ELITE_UPLOADS}2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/retatrutide/vial/30000': `${ELITE_UPLOADS}2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/retatrutide/vial/60000': `${ELITE_UPLOADS}2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/retatrutide/vial/100000': `${ELITE_UPLOADS}2026/08/COA_GLP-3_R_30mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/tirzepatide/vial/15000': `${ELITE_UPLOADS}2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/tirzepatide/vial/20000': `${ELITE_UPLOADS}2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/tirzepatide/vial/30000': `${ELITE_UPLOADS}2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/tirzepatide/vial/40000': `${ELITE_UPLOADS}2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/tirzepatide/vial/60000': `${ELITE_UPLOADS}2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/tirzepatide/vial/120000': `${ELITE_UPLOADS}2026/06/COA_GLP2-T_20mg_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/semaglutide/vial/5000': `${ELITE_UPLOADS}2026/08/COA_SLP-1_S_10mg_2026-07-22_2026-08-11_EEB-1.pdf`,
  'elite-edge-biotech-2/semaglutide/vial/10000': `${ELITE_UPLOADS}2026/08/COA_SLP-1_S_10mg_2026-07-22_2026-08-11_EEB-1.pdf`,
  'elite-edge-biotech-2/cagrilintide/vial/10000': `${ELITE_UPLOADS}2026/06/COA_Cagrilintide_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/ipamorelin/vial/10000': `${ELITE_UPLOADS}2026/05/Ipamorelin-10mg-01-scaled.webp`,
  'elite-edge-biotech-2/tesamorelin/vial/10000': `${ELITE_UPLOADS}2026/08/COA_Tesamorelin_20mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/tesamorelin/vial/20000': `${ELITE_UPLOADS}2026/08/COA_Tesamorelin_20mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/sermorelin/vial/10000': `${ELITE_UPLOADS}2026/08/COA_Sermorelin_10mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/nad/vial/500000': `${ELITE_UPLOADS}2026/06/COA_NADplus_blue_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/nad/vial/1000000': `${ELITE_UPLOADS}2026/06/COA_NADplus_blue_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/semax/vial/30000': `${ELITE_UPLOADS}2026/05/Semax-30mg-01-scaled.webp`,
  'elite-edge-biotech-2/selank/vial/5000': `${ELITE_UPLOADS}2026/06/COA_Selank_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/pt-141/vial/10000': `${ELITE_UPLOADS}2026/06/COA_PT-141_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/dsip/vial/5000': `${ELITE_UPLOADS}2026/06/COA_DSIP_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/ghrp-2/vial/5000': `${ELITE_UPLOADS}2026/08/COA_GHRP-2_5mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/ahk-cu/vial/100000': `${ELITE_UPLOADS}2026/08/AHK-100mg.png`,
  'elite-edge-biotech-2/melanotan-2/vial/10000': `${ELITE_UPLOADS}2026/06/COA_Melanotan2_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/cjc-1295-no-dac/vial/5000': `${ELITE_UPLOADS}2026/08/COA_CJC-1295_noDAC_10mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/cjc-1295-no-dac/vial/10000': `${ELITE_UPLOADS}2026/08/COA_CJC-1295_noDAC_10mg_2026-07-22_2026-08-11_EEB.pdf`,
  'elite-edge-biotech-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${ELITE_UPLOADS}2026/06/COA_Ipamorelin_CJC-1295_nD_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/ipamorelin-cjc-1295-no-dac/vial/20000': `${ELITE_UPLOADS}2026/06/COA_Ipamorelin_CJC-1295_nD_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${ELITE_UPLOADS}2026/06/COA_GLOW_2026-05-28_20260612_EEB.pdf`,
  'elite-edge-biotech-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${ELITE_UPLOADS}2026/06/COA_KLOW_2026-05-28_20260612_EEB.pdf`,

  // American Peptides
  // The vendor lists its Selank vial certificate for the nasal spray as well, and one certificate for the
  // BPC-157 + TB-500 listing it also sells as Wolverine.
  'american-peptides-2/bpc-157/vial/5000': `${AMERICAN_PEPTIDES_DOCS}COA7609.pdf`,
  'american-peptides-2/bpc-157/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7603.pdf`,
  'american-peptides-2/bpc-157/vial/15000': `${AMERICAN_PEPTIDES_DOCS}COA7581.pdf`,
  'american-peptides-2/tb-500/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7595.pdf`,
  'american-peptides-2/bpc-157-tb-500/vial/20000': `${AMERICAN_PEPTIDES_DOCS}COA7621.pdf`,
  'american-peptides-2/wolverine/vial/20000': `${AMERICAN_PEPTIDES_DOCS}COA7621.pdf`,
  'american-peptides-2/ghk-cu/vial/50000': `${AMERICAN_PEPTIDES_DOCS}COA7628.pdf`,
  'american-peptides-2/ghk-cu/vial/100000': `${AMERICAN_PEPTIDES_DOCS}COA7578.pdf`,
  'american-peptides-2/retatrutide/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7580.pdf`,
  'american-peptides-2/retatrutide/vial/20000': `${AMERICAN_PEPTIDES_DOCS}COA7599.pdf`,
  'american-peptides-2/retatrutide/vial/30000': `${AMERICAN_PEPTIDES_DOCS}COA7619.pdf`,
  'american-peptides-2/retatrutide/vial/48000': `${AMERICAN_PEPTIDES_DOCS}COA5633.pdf?v=1783356157`,
  'american-peptides-2/retatrutide/vial/60000': `${AMERICAN_PEPTIDES_DOCS}COA7629.pdf`,
  'american-peptides-2/tirzepatide/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7606.pdf`,
  'american-peptides-2/tirzepatide/vial/20000': `${AMERICAN_PEPTIDES_DOCS}COA7623.pdf`,
  'american-peptides-2/tirzepatide/vial/30000': `${AMERICAN_PEPTIDES_DOCS}COA7617.pdf`,
  'american-peptides-2/tirzepatide/vial/60000': `${AMERICAN_PEPTIDES_DOCS}COA7613.pdf`,
  'american-peptides-2/tirzepatide/vial/100000': `${AMERICAN_PEPTIDES_DOCS}COA7593.pdf`,
  'american-peptides-2/semaglutide/vial/5000': `${AMERICAN_PEPTIDES_DOCS}COA7591.pdf`,
  'american-peptides-2/semaglutide/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA5632.pdf?v=1783356154`,
  'american-peptides-2/semaglutide/vial/20000': `${AMERICAN_PEPTIDES_DOCS}COA4845_f5bc67a9-b26b-443c-b2ee-eab7ed8ef6a0.pdf?v=1780951580`,
  'american-peptides-2/semaglutide/vial/30000': `${AMERICAN_PEPTIDES_DOCS}COA7612.pdf`,
  'american-peptides-2/ipamorelin/vial/5000': `${AMERICAN_PEPTIDES_DOCS}COA7600.pdf`,
  'american-peptides-2/ipamorelin/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7624.pdf`,
  'american-peptides-2/tesamorelin/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7630.pdf`,
  'american-peptides-2/tesamorelin/vial/20000': `${AMERICAN_PEPTIDES_DOCS}COA7605.pdf`,
  'american-peptides-2/sermorelin/vial/5000': `${AMERICAN_PEPTIDES_DOCS}COA3372.pdf?v=2745209496895048776`,
  'american-peptides-2/nad/vial/500000': `${AMERICAN_PEPTIDES_DOCS}COA7592.pdf`,
  'american-peptides-2/nad/vial/1000000': `${AMERICAN_PEPTIDES_DOCS}COA7611.pdf`,
  'american-peptides-2/mots-c/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7589.pdf`,
  'american-peptides-2/mots-c/vial/40000': `${AMERICAN_PEPTIDES_DOCS}COA7618.pdf`,
  'american-peptides-2/epitalon/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7622.pdf`,
  'american-peptides-2/semax/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7586.pdf`,
  'american-peptides-2/selank/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7627.pdf`,
  'american-peptides-2/selank/spray/5000': `${AMERICAN_PEPTIDES_DOCS}COA7627.pdf`,
  'american-peptides-2/pt-141/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7625.pdf`,
  'american-peptides-2/5-amino-1mq/vial/50000': `${AMERICAN_PEPTIDES_DOCS}COA7587.pdf`,
  'american-peptides-2/melanotan-i/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA3394.pdf?v=2`,
  'american-peptides-2/cjc-1295-no-dac/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7601.pdf`,
  'american-peptides-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7607.pdf`,
  'american-peptides-2/ipamorelin-cjc-1295-no-dac/vial/20000': `${AMERICAN_PEPTIDES_DOCS}COA7631.pdf`,
  'american-peptides-2/dsip/vial/5000': `${AMERICAN_PEPTIDES_DOCS}COA7602.pdf`,
  'american-peptides-2/glutathione/vial/600000': `${AMERICAN_PEPTIDES_DOCS}COA4841_94653df7-283c-4032-bf2e-876da658963c.pdf?v=1780951568`,
  'american-peptides-2/glutathione/vial/1500000': `${AMERICAN_PEPTIDES_DOCS}COA7597.pdf`,
  'american-peptides-2/ss-31-elamipretide/vial/10000': `${AMERICAN_PEPTIDES_DOCS}COA7584.pdf`,
  'american-peptides-2/ss-31-elamipretide/vial/30000': `${AMERICAN_PEPTIDES_DOCS}COA7579.pdf`,
  'american-peptides-2/ss-31-elamipretide/vial/50000': `${AMERICAN_PEPTIDES_DOCS}COA7590.pdf`,
  'american-peptides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${AMERICAN_PEPTIDES_DOCS}COA7598.pdf`,
  'american-peptides-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${AMERICAN_PEPTIDES_DOCS}COA7577.pdf`,

  // Synthesis Peptides
  // Where the vendor publishes one certificate for several sizes of a compound, every size links to it.
  'synthesis-peptides-2/bpc-157/vial/10000': `${SYNTHESIS_FILES}BPC-157%2010mg--SYNT2607220092-01KZW2A307M8N1NXDQHTXRJHBF.pdf`,
  'synthesis-peptides-2/tb-500/vial/10000': `${SYNTHESIS_FILES}TB-500-10mg-TB10926---SYNT2608110689-01M0GPPQN037NYJ03XJS95NMZ1.pdf`,
  'synthesis-peptides-2/bpc-157-tb-500/vial/10000': `${SYNTHESIS_FILES}Wolverine-Blend-10mg-WOLV20926---SYNT2608110759-01M0GPPRAE8KRXHQM7PCGJ80WC.pdf`,
  'synthesis-peptides-2/bpc-157-tb-500/vial/20000': `${SYNTHESIS_FILES}Wolverine-Blend-10mg-WOLV20926---SYNT2608110759-01M0GPPRAE8KRXHQM7PCGJ80WC.pdf`,
  'synthesis-peptides-2/ghk-cu/vial/50000': `${SYNTHESIS_FILES}GHK-Cu_GHK50626_COA-01M1PKMS5W9WAXGKHXA3MPNT51.pdf`,
  'synthesis-peptides-2/retatrutide/vial/10000': `${SYNTHESIS_FILES}Retatrutide-10mg-3GR10926---SYNT2608110724-01M0GPPS06CNFHV2PYHJJARCTE.pdf`,
  'synthesis-peptides-2/retatrutide/vial/20000': `${SYNTHESIS_FILES}Retatrutide-10mg-3GR10926---SYNT2608110724-01M0GPPS06CNFHV2PYHJJARCTE.pdf`,
  'synthesis-peptides-2/retatrutide/vial/40000': `${SYNTHESIS_FILES}Retatrutide-10mg-3GR10926---SYNT2608110724-01M0GPPS06CNFHV2PYHJJARCTE.pdf`,
  'synthesis-peptides-2/tirzepatide/vial/10000': `${SYNTHESIS_FILES}glp-2t-2026-05-08-23-01KXSEYRGS7Z1ZGYSJ7ABV2R9Z.pdf`,
  'synthesis-peptides-2/tirzepatide/vial/15000': `${SYNTHESIS_FILES}glp-2t-2026-05-08-23-01KXSEYRGS7Z1ZGYSJ7ABV2R9Z.pdf`,
  'synthesis-peptides-2/semaglutide/vial/10000': `${SYNTHESIS_FILES}Semaglutide%2010mg--SYNT2607220008-01KZW2A1Z0D2MR0CTXAZHBEND2.pdf`,
  'synthesis-peptides-2/cagrilintide/vial/5000': `${SYNTHESIS_FILES}cagrilintide-amylin-analogue-2025-09-12-9-01KXSEYMHQTS0YG7Q8SFT1DBWM.pdf`,
  'synthesis-peptides-2/ipamorelin/vial/10000': `${SYNTHESIS_FILES}ipamorelin-2026-05-08-38-01KXSEYX1YP21YT48SJK3A187Y.pdf`,
  'synthesis-peptides-2/tesamorelin/vial/10000': `${SYNTHESIS_FILES}tesamorelin-2026-05-20-77-01KXSEZ86CPY6YAKMK5EA3VMBD.pdf`,
  'synthesis-peptides-2/sermorelin/vial/10000': `${SYNTHESIS_FILES}Sermorelin_SERM10626_COA-01M1PKJ57DN696D6CKDEH2YVY9.pdf`,
  'synthesis-peptides-2/nad/vial/500000': `${SYNTHESIS_FILES}nad-2026-07-05-55-01KXSEZ20M4G426RHRC59CPZZ0.pdf`,
  'synthesis-peptides-2/mots-c/vial/10000': `${SYNTHESIS_FILES}MOTS-C%2040mg--synthesis-peptides-MOT40726-MSAyep-01KZW2A4JVR52FEPV4KM3YZFC0.pdf`,
  'synthesis-peptides-2/mots-c/vial/40000': `${SYNTHESIS_FILES}MOTS-C%2040mg--synthesis-peptides-MOT40726-MSAyep-01KZW2A4JVR52FEPV4KM3YZFC0.pdf`,
  'synthesis-peptides-2/epitalon/vial/10000': `${SYNTHESIS_FILES}Epithalon_50mg_LotEPI50826_969-01KY7R7YP8CTBAJG66VSEW5NVR.pdf`,
  'synthesis-peptides-2/epitalon/vial/50000': `${SYNTHESIS_FILES}Epithalon_50mg_LotEPI50826_969-01KY7R7YP8CTBAJG66VSEW5NVR.pdf`,
  'synthesis-peptides-2/semax/vial/10000': `${SYNTHESIS_FILES}semax-2026-05-08-64-01KXSEZ4MNVH4S7071FZ4W4QGH.pdf`,
  'synthesis-peptides-2/semax/vial/30000': `${SYNTHESIS_FILES}semax-2026-05-08-64-01KXSEZ4MNVH4S7071FZ4W4QGH.pdf`,
  'synthesis-peptides-2/selank/vial/10000': `${SYNTHESIS_FILES}Selank-30mg-SEL30926---SYNT2608110654-01M0GPPQ7JZMAXD6GC09FNZQRW.pdf`,
  'synthesis-peptides-2/selank/vial/30000': `${SYNTHESIS_FILES}Selank-30mg-SEL30926---SYNT2608110654-01M0GPPQ7JZMAXD6GC09FNZQRW.pdf`,
  'synthesis-peptides-2/pt-141/vial/10000': `${SYNTHESIS_FILES}PT-141%2010mg--SYNT2607220064-01KZW2A2P1NNG6ESCRDFD4GCVY.pdf`,
  'synthesis-peptides-2/5-amino-1mq/vial/10000': `${SYNTHESIS_FILES}5-amino-1mq-2025-09-12-0-01KXSEYHBKYMHR2MBHS353Z6DP.pdf`,
  'synthesis-peptides-2/5-amino-1mq/vial/50000': `${SYNTHESIS_FILES}5-amino-1mq-2025-09-12-0-01KXSEYHBKYMHR2MBHS353Z6DP.pdf`,
  'synthesis-peptides-2/ss-31-elamipretide/vial/10000': `${SYNTHESIS_FILES}mitoss-31-2026-07-07-70-01KXSEZ6748MVT7M3M7BFZ15Y8.pdf`,
  'synthesis-peptides-2/ss-31-elamipretide/vial/50000': `${SYNTHESIS_FILES}mitoss-31-2026-07-07-70-01KXSEZ6748MVT7M3M7BFZ15Y8.pdf`,
  'synthesis-peptides-2/dsip/vial/5000': `${SYNTHESIS_FILES}dsip-2025-12-27-13-01KXSEYNSKDHZS67GVXNDRCFQ4.pdf`,
  'synthesis-peptides-2/dsip/vial/10000': `${SYNTHESIS_FILES}dsip-2025-12-27-13-01KXSEYNSKDHZS67GVXNDRCFQ4.pdf`,
  'synthesis-peptides-2/glutathione/vial/1500000': `${SYNTHESIS_FILES}glutathione-test-01KXSCNG6Q1K5NJ2XKCCHZ28AD.pdf`,
  'synthesis-peptides-2/melanotan-2/vial/10000': `${SYNTHESIS_FILES}Melanotan-II-10mg-MT210926---SYNT2608110794-01M0GPPRKN0V41GQ5QV0X9TSGD.pdf`,
  'synthesis-peptides-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${SYNTHESIS_FILES}cjc-1295-no-dac-ipamorelin-2026-05-24-10-01KXSEYMXQ7H7A5DNMA2BFX6RT.pdf`,
  'synthesis-peptides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${SYNTHESIS_FILES}glow-70-blend-2026-05-08-20-01KXSEYQQVWVD4Z9M61VTH44XR.pdf`,
  'synthesis-peptides-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${SYNTHESIS_FILES}KLOW-Blend-80mg-KLOW80926---SYNT2608110619-01M0GPKC6KFVTAQQ3BEYWM592G.pdf`,

  // Prime Peptide Solutions
  // Only listings supplied with a COA. Where the vendor publishes one certificate for several sizes of a
  // compound, every size links to it, and one certificate for the BPC-157 + TB-500 listing it also sells
  // as Wolverine.
  'prime-peptide-solutions-2/bpc-157-tb-500/vial/20000': `${PRIME_COAS}9823a55c1748084d.pdf`,
  'prime-peptide-solutions-2/wolverine/vial/20000': `${PRIME_COAS}9823a55c1748084d.pdf`,
  'prime-peptide-solutions-2/ghk-cu/vial/50000': `${PRIME_COAS}a3d03aae010a55f1.pdf`,
  'prime-peptide-solutions-2/ghk-cu/vial/100000': `${PRIME_COAS}a3d03aae010a55f1.pdf`,
  'prime-peptide-solutions-2/retatrutide/vial/10000': `${PRIME_COAS}27fcf7dbcfa0815e.pdf`,
  'prime-peptide-solutions-2/retatrutide/vial/20000': `${PRIME_COAS}27fcf7dbcfa0815e.pdf`,
  'prime-peptide-solutions-2/tesamorelin/vial/10000': `${PRIME_COAS}819602f49a7ade0e.pdf`,
  'prime-peptide-solutions-2/tesamorelin/vial/20000': `${PRIME_COAS}819602f49a7ade0e.pdf`,
  'prime-peptide-solutions-2/mots-c/vial/10000': `${PRIME_COAS}18431061806aee71.pdf`,
  'prime-peptide-solutions-2/mots-c/vial/20000': `${PRIME_COAS}18431061806aee71.pdf`,
  'prime-peptide-solutions-2/mots-c/vial/40000': `${PRIME_COAS}18431061806aee71.pdf`,
  'prime-peptide-solutions-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${PRIME_COAS}08cfb01fb663ebe1.pdf`,
  'prime-peptide-solutions-2/ipamorelin-cjc-1295-no-dac/vial/20000': `${PRIME_COAS}08cfb01fb663ebe1.pdf`,
  'prime-peptide-solutions-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${PRIME_COAS}423996e09f0e7a56.pdf`,

  // Pepvida
  'pepvida-2/bpc-157-tb-500/vial/10000': `${PEPVIDA_COAS}heal.pdf`,
  'pepvida-2/ghk-cu/vial/50000': `${PEPVIDA_UPLOADS}2026/08/PEPVIDA-GHK-CU-50-010526.pdf`,
  'pepvida-2/retatrutide/vial/10000': `${PEPVIDA_COAS}reset.pdf`,
  'pepvida-2/mots-c/vial/10000': `${PEPVIDA_COAS}activate.pdf`,
  'pepvida-2/tesamorelin/vial/10000': `${PEPVIDA_COAS}amplify.pdf`,
  'pepvida-2/nad/vial/500000': `${PEPVIDA_COAS}renew.pdf`,
  'pepvida-2/glutathione/vial/1200000': `${PEPVIDA_COAS}detox.pdf`,
  'pepvida-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${PEPVIDA_UPLOADS}2026/08/PEPVIDA-KLOW-80-032026.pdf`,
  'pepvida-2/bacteriostatic-water/vial/10000': `${PEPVIDA_COAS}water.pdf`,

  // Vantage Aminos
  // Only listings supplied with a COA. The vendor lists its BPC-157 vial certificate for the nasal spray as well.
  'vantage-aminos-2/bpc-157/vial/5000': `${VANTAGE_UPLOADS}2026/08/bpc-157-coa-VA-2512-8344.pdf`,
  'vantage-aminos-2/bpc-157/spray/5000': `${VANTAGE_UPLOADS}2026/08/bpc-157-coa-VA-2512-8344.pdf`,
  'vantage-aminos-2/ghk-cu/vial/50000': `${VANTAGE_UPLOADS}2026/08/ghk-cu-coa-VA-2512-0552.pdf`,
  'vantage-aminos-2/retatrutide/vial/10000': `${VANTAGE_UPLOADS}2026/07/glp-3-reta-coa-VA-2512-4676.pdf`,
  'vantage-aminos-2/tirzepatide/vial/5000': `${VANTAGE_UPLOADS}2026/07/glp-2-tirz-coa-VA-2512-0836.pdf`,
  'vantage-aminos-2/semaglutide/vial/5000': `${VANTAGE_UPLOADS}2026/07/glp-1-sema-coa-VA-2512-4447-1.pdf`,
  'vantage-aminos-2/cjc-1295-no-dac/vial/5000': `${VANTAGE_UPLOADS}2026/08/cjc-1295-no-dac-coa-VA-2512-9601.pdf`,
  'vantage-aminos-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${VANTAGE_UPLOADS}2026/07/glow-coa-VA-2602-7527.pdf`,

  // Certa Peptides
  // Janoshik test reports. The vendor lists one report for every size of a compound, and its BPC-157 + TB-500
  // blend report for TB-500 as well.
  'certa-peptides-2/retatrutide/vial/5000': `${JANOSHIK_TESTS}212146-Retatrutide_20mg_TSIS765B8HAH`,
  'certa-peptides-2/retatrutide/vial/10000': `${JANOSHIK_TESTS}212146-Retatrutide_20mg_TSIS765B8HAH`,
  'certa-peptides-2/retatrutide/vial/15000': `${JANOSHIK_TESTS}212146-Retatrutide_20mg_TSIS765B8HAH`,
  'certa-peptides-2/retatrutide/vial/20000': `${JANOSHIK_TESTS}212146-Retatrutide_20mg_TSIS765B8HAH`,
  'certa-peptides-2/retatrutide/vial/30000': `${JANOSHIK_TESTS}212146-Retatrutide_20mg_TSIS765B8HAH`,
  'certa-peptides-2/retatrutide/vial/50000': `${JANOSHIK_TESTS}212146-Retatrutide_20mg_TSIS765B8HAH`,
  'certa-peptides-2/bpc-157/vial/2000': `${JANOSHIK_TESTS}200860-BPC157_20mg_G6T6AXH34XVS`,
  'certa-peptides-2/bpc-157/vial/5000': `${JANOSHIK_TESTS}200860-BPC157_20mg_G6T6AXH34XVS`,
  'certa-peptides-2/bpc-157/vial/10000': `${JANOSHIK_TESTS}200860-BPC157_20mg_G6T6AXH34XVS`,
  'certa-peptides-2/bpc-157/vial/20000': `${JANOSHIK_TESTS}200860-BPC157_20mg_G6T6AXH34XVS`,
  'certa-peptides-2/tb-500/vial/2000': `${JANOSHIK_TESTS}136729-BPC157_TB500_10mg_Z389R9WPGKD7`,
  'certa-peptides-2/tb-500/vial/5000': `${JANOSHIK_TESTS}136729-BPC157_TB500_10mg_Z389R9WPGKD7`,
  'certa-peptides-2/tb-500/vial/10000': `${JANOSHIK_TESTS}136729-BPC157_TB500_10mg_Z389R9WPGKD7`,
  'certa-peptides-2/tb-500/vial/20000': `${JANOSHIK_TESTS}136729-BPC157_TB500_10mg_Z389R9WPGKD7`,
  'certa-peptides-2/bpc-157-tb-500/vial/10000': `${JANOSHIK_TESTS}136729-BPC157_TB500_10mg_Z389R9WPGKD7`,
  'certa-peptides-2/ghk-cu/vial/50000': `${JANOSHIK_TESTS}212150-GHKCu_100mg_D3CDH5Q9BKW7`,
  'certa-peptides-2/ghk-cu/vial/100000': `${JANOSHIK_TESTS}212150-GHKCu_100mg_D3CDH5Q9BKW7`,
  'certa-peptides-2/mots-c/vial/10000': `${JANOSHIK_TESTS}204783-MOTSc_40mg_6IS4MX16ZVD5`,
  'certa-peptides-2/mots-c/vial/40000': `${JANOSHIK_TESTS}204783-MOTSc_40mg_6IS4MX16ZVD5`,
  'certa-peptides-2/ipamorelin/vial/2000': `${JANOSHIK_TESTS}212161-Ipamorelin_5mg_9YXTYJ15NUFI`,
  'certa-peptides-2/ipamorelin/vial/5000': `${JANOSHIK_TESTS}212161-Ipamorelin_5mg_9YXTYJ15NUFI`,
  'certa-peptides-2/ipamorelin/vial/10000': `${JANOSHIK_TESTS}212161-Ipamorelin_5mg_9YXTYJ15NUFI`,
  'certa-peptides-2/tesamorelin/vial/2000': `${JANOSHIK_TESTS}212154-Tesamorelin_10mg_NNBYCKYCYEK4`,
  'certa-peptides-2/tesamorelin/vial/5000': `${JANOSHIK_TESTS}212154-Tesamorelin_10mg_NNBYCKYCYEK4`,
  'certa-peptides-2/tesamorelin/vial/10000': `${JANOSHIK_TESTS}212154-Tesamorelin_10mg_NNBYCKYCYEK4`,
  'certa-peptides-2/tesamorelin/vial/20000': `${JANOSHIK_TESTS}212154-Tesamorelin_10mg_NNBYCKYCYEK4`,
  'certa-peptides-2/cjc-1295-no-dac/vial/2000': `${JANOSHIK_TESTS}212158-CJC1295_no_DAC_2mg_IZYTXVWA9K3D`,
  'certa-peptides-2/cjc-1295-no-dac/vial/5000': `${JANOSHIK_TESTS}212158-CJC1295_no_DAC_2mg_IZYTXVWA9K3D`,
  'certa-peptides-2/cjc-1295-no-dac/vial/10000': `${JANOSHIK_TESTS}212158-CJC1295_no_DAC_2mg_IZYTXVWA9K3D`,
  'certa-peptides-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${JANOSHIK_TESTS}155228-CJC1295_without_DAC_Mod_GRF_129_Ipamorelin_5mg_Blend_EBQMYVYQR4WN`,
  'certa-peptides-2/ipamorelin-cjc-1295-no-dac/vial/20000': `${JANOSHIK_TESTS}155228-CJC1295_without_DAC_Mod_GRF_129_Ipamorelin_5mg_Blend_EBQMYVYQR4WN`,
  'certa-peptides-2/epitalon/vial/10000': `${JANOSHIK_TESTS}212160-Epithalon_50mg_TYNHBXD8FM9R`,
  'certa-peptides-2/epitalon/vial/40000': `${JANOSHIK_TESTS}212160-Epithalon_50mg_TYNHBXD8FM9R`,
  'certa-peptides-2/epitalon/vial/50000': `${JANOSHIK_TESTS}212160-Epithalon_50mg_TYNHBXD8FM9R`,
  'certa-peptides-2/semax/vial/5000': `${JANOSHIK_TESTS}212155-Semax_10mg_F48S54Y1HAYQ`,
  'certa-peptides-2/semax/vial/10000': `${JANOSHIK_TESTS}212155-Semax_10mg_F48S54Y1HAYQ`,
  'certa-peptides-2/semax/vial/30000': `${JANOSHIK_TESTS}212155-Semax_10mg_F48S54Y1HAYQ`,
  'certa-peptides-2/selank/vial/5000': `${JANOSHIK_TESTS}123935-Selank_10mg_3N5W5GFN9ZJ9`,
  'certa-peptides-2/selank/vial/10000': `${JANOSHIK_TESTS}123935-Selank_10mg_3N5W5GFN9ZJ9`,
  'certa-peptides-2/selank/vial/30000': `${JANOSHIK_TESTS}123935-Selank_10mg_3N5W5GFN9ZJ9`,
  'certa-peptides-2/ss-31-elamipretide/vial/10000': `${JANOSHIK_TESTS}212156-SS31_10mg_BFI6XX5CYX13`,
  'certa-peptides-2/ss-31-elamipretide/vial/50000': `${JANOSHIK_TESTS}212156-SS31_10mg_BFI6XX5CYX13`,
  'certa-peptides-2/glutathione/vial/1500000': `${JANOSHIK_TESTS}212164-Glutathione_1500mg_W5WFGN6ETCD9`,
  'certa-peptides-2/pt-141/vial/10000': `${JANOSHIK_TESTS}212166-PT141_10mg_XWU9H99WKYP1`,
  'certa-peptides-2/melanotan-i/vial/10000': `${JANOSHIK_TESTS}212162-Melanotan1_10mg_U7VIFC5IY9YV`,
  'certa-peptides-2/melanotan-2/vial/5000': `${JANOSHIK_TESTS}155231-MT2_Melanotan_2_Acetate_10mg_52IY2XTLW8J4`,
  'certa-peptides-2/melanotan-2/vial/10000': `${JANOSHIK_TESTS}155231-MT2_Melanotan_2_Acetate_10mg_52IY2XTLW8J4`,
  'certa-peptides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${JANOSHIK_TESTS}136730-GLOW_GHK_or_GHKCu_TB500_BPC157_70mg_7A73FMWNNBXP`,
  'certa-peptides-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${JANOSHIK_TESTS}172225-KLOW_80mg_GHKCu_TB500_BPC157_KPV_W34FXTSZG3Z4`,
  'certa-peptides-2/bacteriostatic-water/vial/3000': `${JANOSHIK_TESTS}155229-Bacteriostatic_Water_10ml_H63R5HRGK5XG`,
  'certa-peptides-2/bacteriostatic-water/vial/5000': `${JANOSHIK_TESTS}155229-Bacteriostatic_Water_10ml_H63R5HRGK5XG`,
  'certa-peptides-2/bacteriostatic-water/vial/10000': `${JANOSHIK_TESTS}155229-Bacteriostatic_Water_10ml_H63R5HRGK5XG`,

  // Ameano Peptides
  // Only listings supplied with a test report. Where the vendor publishes one report for several sizes of a
  // compound, every size links to it.
  'ameano-peptides-2/bpc-157/vial/10000': `${AMEANO_UPLOADS}2025/04/Test-Report-163728.png`,
  'ameano-peptides-2/bpc-157-tb-500/vial/10000': `${AMEANO_UPLOADS}2025/06/Test-Report-163740.png`,
  'ameano-peptides-2/bpc-157-tb-500/vial/20000': `${AMEANO_UPLOADS}2025/06/Test-Report-163740.png`,
  'ameano-peptides-2/ghk-cu/vial/50000': `${AMEANO_UPLOADS}2025/05/Test-Report-167749-1.png`,
  'ameano-peptides-2/ghk-cu/vial/100000': `${AMEANO_UPLOADS}2025/08/Test-Report-168796.png`,
  'ameano-peptides-2/retatrutide/vial/6000': `${AMEANO_UPLOADS}2025/04/Test-Report-163746.png`,
  'ameano-peptides-2/retatrutide/vial/24000': `${AMEANO_UPLOADS}2025/04/Test-Report-163746.png`,
  'ameano-peptides-2/semaglutide/vial/5000': `${AMEANO_UPLOADS}2025/04/Test-Report-110979.png`,
  'ameano-peptides-2/cagrilintide/vial/5000': `${AMEANO_UPLOADS}2025/04/Test-Report-166062.png`,
  'ameano-peptides-2/cagrilintide/vial/10000': `${AMEANO_UPLOADS}2025/04/Test-Report-166062.png`,
  'ameano-peptides-2/ipamorelin/vial/10000': `${AMEANO_UPLOADS}2025/04/Test-Report-183198.png`,
  'ameano-peptides-2/tesamorelin/vial/10000': `${AMEANO_UPLOADS}2025/04/Test-Report-134377.png`,
  'ameano-peptides-2/sermorelin/vial/5000': `${AMEANO_UPLOADS}2025/05/Test-Report-164163.png`,
  'ameano-peptides-2/nad/vial/500000': `${AMEANO_UPLOADS}2025/05/Test-Report-198991.png`,
  'ameano-peptides-2/mots-c/vial/10000': `${AMEANO_UPLOADS}2025/04/Test-Report-136295.png`,
  'ameano-peptides-2/epitalon/vial/10000': `${AMEANO_UPLOADS}2025/05/Test-Report-171643.png`,
  'ameano-peptides-2/pt-141/vial/10000': `${AMEANO_UPLOADS}2025/04/Test-Report-166068.png`,
  'ameano-peptides-2/5-amino-1mq/vial/50000': `${AMEANO_UPLOADS}2025/09/Test-Report-149292.png`,
  'ameano-peptides-2/melanotan-i/vial/10000': `${AMEANO_UPLOADS}2025/05/Test-Report-164161.png`,
  'ameano-peptides-2/melanotan-2/vial/10000': `${AMEANO_UPLOADS}2025/05/Test-Report-194688.png`,
  'ameano-peptides-2/cjc-1295-no-dac/vial/5000': `${AMEANO_UPLOADS}2025/05/Test-Report-168784.png`,
  'ameano-peptides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${AMEANO_UPLOADS}2025/04/Test-Report-163743.png`,
  'ameano-peptides-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${AMEANO_UPLOADS}2025/06/Test-Report-163737.png`,

  // Elevate Research Co
  // Where the vendor publishes one certificate for several sizes of a compound, every size links to it. The
  // water's link is the vendor's general quality page, the one supplied for it.
  'elevate-research-co-2/retatrutide/vial/10000': `${ELEVATE_SITE}/assets/coa/retatrutide.pdf`,
  'elevate-research-co-2/retatrutide/vial/20000': `${ELEVATE_SITE}/assets/coa/retatrutide.pdf`,
  'elevate-research-co-2/tirzepatide/vial/10000': `${ELEVATE_SITE}/assets/coa/tirzepatide.pdf`,
  'elevate-research-co-2/semaglutide/vial/10000': `${ELEVATE_SITE}/assets/coa/semaglutide.pdf`,
  'elevate-research-co-2/bpc-157/vial/10000': `${ELEVATE_SITE}/assets/coa/bpc-157.pdf`,
  'elevate-research-co-2/bpc-157-tb-500/vial/10000': `${ELEVATE_SITE}/assets/coa/bpc-tb-blend.pdf`,
  'elevate-research-co-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${ELEVATE_SITE}/coa/glow-blend.html`,
  'elevate-research-co-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${ELEVATE_SITE}/coa/cjc-ipamorelin-blend.html`,
  'elevate-research-co-2/ghk-cu/vial/100000': `${ELEVATE_SITE}/coa/ghk-cu.html`,
  'elevate-research-co-2/tesamorelin/vial/10000': `${ELEVATE_SITE}/coa/tesamorelin.html`,
  'elevate-research-co-2/tesamorelin/vial/20000': `${ELEVATE_SITE}/coa/tesamorelin.html`,
  'elevate-research-co-2/nad/vial/500000': `${ELEVATE_SITE}/coa/nad-plus.html`,
  'elevate-research-co-2/mots-c/vial/10000': `${ELEVATE_SITE}/coa/mots-c.html`,
  'elevate-research-co-2/selank/vial/10000': `${ELEVATE_SITE}/coa/selank.html`,
  'elevate-research-co-2/semax/vial/10000': `${ELEVATE_SITE}/coa/semax.html`,
  'elevate-research-co-2/melanotan-2/vial/10000': `${ELEVATE_SITE}/coa/melanotan-2.html`,
  'elevate-research-co-2/melanotan-i/vial/10000': `${ELEVATE_SITE}/coa/melanotan-1.html`,
  'elevate-research-co-2/bacteriostatic-water/vial/3000': `${ELEVATE_SITE}/quality-coa.html`,

  // Dynotides
  // Where the vendor publishes one certificate for several sizes of a compound, every size links to it.
  'dynotides-2/bpc-157/vial/5000': `${DYNOTIDES_COAS}bpc-157-5mg-coa-js.webp`,
  'dynotides-2/bpc-157/vial/10000': `${DYNOTIDES_COAS}bpc-157-5mg-coa-js.webp`,
  'dynotides-2/tb-500/vial/5000': `${DYNOTIDES_COAS}tb-500-5mg-coa-js.webp`,
  'dynotides-2/ghk-cu/vial/50000': `${DYNOTIDES_COAS}ghk-cu-50mg-coa-fr4.webp`,
  'dynotides-2/ghk-cu/vial/100000': `${DYNOTIDES_COAS}ghk-cu-50mg-coa-fr4.webp`,
  'dynotides-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${DYNOTIDES_COAS}cjc-ipamorelin-coa-js.webp`,
  'dynotides-2/ipamorelin/vial/10000': `${DYNOTIDES_COAS}ipamorelin-coa-js.webp`,
  'dynotides-2/tesamorelin/vial/10000': `${DYNOTIDES_COAS}tesamorelin-coa-fr.webp`,
  'dynotides-2/sermorelin/vial/10000': `${DYNOTIDES_COAS}sermorelin-coa-js.webp`,
  'dynotides-2/nad/vial/500000': `${DYNOTIDES_COAS}nad-plus-500-coa-js.webp`,
  'dynotides-2/nad/vial/1000000': `${DYNOTIDES_COAS}nad-plus-500-coa-js.webp`,
  'dynotides-2/mots-c/vial/10000': `${DYNOTIDES_COAS}mots-c-10mg-coa-js.webp`,
  'dynotides-2/epitalon/vial/10000': `${DYNOTIDES_COAS}epitalon-10mg-coa-js.webp`,
  'dynotides-2/semax/vial/10000': `${DYNOTIDES_COAS}semax-coa-js.webp`,
  'dynotides-2/selank/vial/10000': `${DYNOTIDES_COAS}selank-coa-js.webp`,
  'dynotides-2/dsip/vial/10000': `${DYNOTIDES_COAS}dsip-10mg-coa-endo.webp`,
  'dynotides-2/melanotan-2/vial/10000': `${DYNOTIDES_COAS}melanotan-ii-coa-js.webp`,
  'dynotides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${DYNOTIDES_COAS}glow-blend-coa-js.webp`,
  'dynotides-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${DYNOTIDES_COAS}klow-blend-coa-js.webp`,

  // LA Peptides
  // TB500, GLOW and the water use the vendor's general certificates page (VENDOR_COA_PAGES below);
  // every other listing has its own certificate or lab-test page. The vendor lists one certificate
  // for all three LAP-3 (R) sizes, and one for both LAP-2 (T) sizes.
  'la-peptides-2/bpc-157/capsule/500': `${LA_PEPTIDES_UPLOADS}2025/06/bpc_157_LAPe2509150143.png`,
  'la-peptides-2/bpc-157-tb-500/vial/20000': `${LA_PEPTIDES_LAB_TEST}bpc-tb500-blend/`,
  'la-peptides-2/bpc-157-tb-500/vial/40000': `${LA_PEPTIDES_LAB_TEST}bpc-tb500-blend/`,
  'la-peptides-2/bpc-157-tb-500/capsule/1000': `${LA_PEPTIDES_LAB_TEST}repair-fix/`,
  'la-peptides-2/ghk-cu/vial/100000': `${LA_PEPTIDES_LAB_TEST}ghk-cu/`,
  'la-peptides-2/ghk-cu/capsule/2500': `${LA_PEPTIDES_LAB_TEST}ghk-cu-capsules/`,
  'la-peptides-2/retatrutide/vial/10000': `${LA_PEPTIDES_UPLOADS}2025/06/GLP3-R_10mg_COA3135-scaled.png`,
  'la-peptides-2/retatrutide/vial/20000': `${LA_PEPTIDES_UPLOADS}2025/06/GLP3-R_10mg_COA3135-scaled.png`,
  'la-peptides-2/retatrutide/vial/30000': `${LA_PEPTIDES_UPLOADS}2025/06/GLP3-R_10mg_COA3135-scaled.png`,
  'la-peptides-2/tirzepatide/vial/15000': `${LA_PEPTIDES_UPLOADS}2026/05/glp2-t-15mg-COA520-scaled.png`,
  'la-peptides-2/tirzepatide/vial/30000': `${LA_PEPTIDES_UPLOADS}2026/05/glp2-t-15mg-COA520-scaled.png`,
  'la-peptides-2/tesamorelin/vial/10000': `${LA_PEPTIDES_LAB_TEST}tesamorelin/`,
  'la-peptides-2/mots-c/vial/10000': `${LA_PEPTIDES_LAB_TEST}mots-c/`,
  'la-peptides-2/ipamorelin-cjc-1295-no-dac/vial/20000': `${LA_PEPTIDES_LAB_TEST}cjc-no-dac-ipamorelin-blend/`,

  // Trusted Peps
  // Only listings supplied with their own certificate image; everything else uses the vendor's
  // general COA page (VENDOR_COA_PAGES below).
  'trusted-peps-2/ghk-cu/vial/50000': `${TRUSTED_PEPS_UPLOADS}2026/07/COA-GHK-Cu-50MG.png`,
  'trusted-peps-2/tesamorelin/vial/10000': `${TRUSTED_PEPS_UPLOADS}2026/07/COA-Tesa-10MG.png`,
  'trusted-peps-2/nad/vial/500000': `${TRUSTED_PEPS_UPLOADS}2026/07/COA-NAD-500MG.png`,
  'trusted-peps-2/mots-c/vial/10000': `${TRUSTED_PEPS_UPLOADS}2026/07/COA-MOTS-C-10MG-3.png`,
  'trusted-peps-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${TRUSTED_PEPS_UPLOADS}2026/06/img_1227.jpeg`,

  // Axis Peptide Labs
  // No general COA page was supplied for this vendor; only listings with their own certificate are
  // linked here. The vendor lists one certificate for both BPC-157 sizes and both GHK-Cu sizes, and
  // shares a Retatrutide certificate across 30 mg/60 mg and a Tirzepatide one across 20 mg/30 mg.
  'axis-peptide-labs-2/bpc-157/vial/5000': `${AXIS_UPLOADS}2026/02/AXIS-COA-BPC5.webp`,
  'axis-peptide-labs-2/bpc-157/vial/10000': `${AXIS_UPLOADS}2026/02/AXIS-COA-BPC5.webp`,
  'axis-peptide-labs-2/tb-500/vial/5000': `${AXIS_UPLOADS}2026/02/AXIS-COA-TB5.webp`,
  'axis-peptide-labs-2/wolverine/vial/10000': `${AXIS_UPLOADS}2026/09/AXIS-COA-WOLV10-FD.webp`,
  'axis-peptide-labs-2/wolverine/vial/20000': `${AXIS_UPLOADS}2026/09/AXIS-COA-WOLV10-FD.webp`,
  'axis-peptide-labs-2/ghk-cu/vial/50000': `${AXIS_UPLOADS}2026/09/AXIS-COA-GHKCu50-FD.webp`,
  'axis-peptide-labs-2/ghk-cu/vial/100000': `${AXIS_UPLOADS}2026/09/AXIS-COA-GHKCu50-FD.webp`,
  'axis-peptide-labs-2/retatrutide/vial/10000': `${AXIS_UPLOADS}2026/09/AXIS-COA-RT10-APL.pdf`,
  'axis-peptide-labs-2/retatrutide/vial/30000': `${AXIS_UPLOADS}2026/09/AXIS-COA-RT30-FD-v2.webp`,
  'axis-peptide-labs-2/retatrutide/vial/60000': `${AXIS_UPLOADS}2026/09/AXIS-COA-RT30-FD-v2.webp`,
  'axis-peptide-labs-2/tirzepatide/vial/10000': `${AXIS_UPLOADS}2026/09/AXIS-COA-TZ10-APL.pdf`,
  'axis-peptide-labs-2/tirzepatide/vial/20000': `${AXIS_UPLOADS}2026/02/AXIS-COA-TIRZ20.webp`,
  'axis-peptide-labs-2/tirzepatide/vial/30000': `${AXIS_UPLOADS}2026/02/AXIS-COA-TIRZ20.webp`,
  'axis-peptide-labs-2/semaglutide/vial/10000': `${AXIS_UPLOADS}2026/02/AXIS-COA-SM10.webp`,
  'axis-peptide-labs-2/tesamorelin/vial/10000': `${AXIS_UPLOADS}2026/02/AXIS-COA-TSM10.webp`,
  'axis-peptide-labs-2/nad/vial/500000': `${AXIS_UPLOADS}2026/09/AXIS-COA-NAD500-FD.webp`,
  'axis-peptide-labs-2/mots-c/vial/10000': `${AXIS_UPLOADS}2026/09/AXIS-COA-MOTSC10-FD-v2.webp`,
  'axis-peptide-labs-2/semax/vial/5000': `${AXIS_UPLOADS}2026/02/AXIS-COA-XA10.webp`,
  'axis-peptide-labs-2/melanotan-2/vial/10000': `${AXIS_UPLOADS}2026/09/AXIS-COA-MT2-10-APL.pdf`,
  'axis-peptide-labs-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${AXIS_UPLOADS}2026/09/AXIS-COA-CJC10-FD.webp`,
  'axis-peptide-labs-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${AXIS_UPLOADS}2026/09/AXIS-COA-GLOW70-FD.webp`,
  'axis-peptide-labs-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${AXIS_UPLOADS}2026/09/AXIS-COA-KLOW80-FD.webp`,

  // RIVN Research
  // No general COA page was supplied for this vendor; every listing has its own certificate image
  // except CJC-1295 (No DAC), for which none was supplied. Both BPC-157/TB-500 sizes and both
  // Semaglutide sizes share one certificate.
  'rivn-research-2/bpc-157/vial/10000': `${RIVN_UPLOADS}2026/01/img_0367.webp`,
  'rivn-research-2/tb-500/vial/10000': `${RIVN_UPLOADS}2026/03/img_4632.webp`,
  'rivn-research-2/bpc-157-tb-500/vial/10000': `${RIVN_UPLOADS}2026/01/img_1494.webp`,
  'rivn-research-2/bpc-157-tb-500/vial/20000': `${RIVN_UPLOADS}2026/01/img_1494.webp`,
  'rivn-research-2/ghk-cu/vial/100000': `${RIVN_UPLOADS}2026/01/img_1501.webp`,
  'rivn-research-2/retatrutide/vial/10000': `${RIVN_UPLOADS}2026/01/img_7094-1187x1536.webp`,
  'rivn-research-2/retatrutide/vial/20000': `${RIVN_UPLOADS}2026/01/img_7093-1187x1536.webp`,
  'rivn-research-2/retatrutide/vial/30000': `${RIVN_UPLOADS}2026/01/img_7092-1187x1536.webp`,
  'rivn-research-2/retatrutide/vial/60000': `${RIVN_UPLOADS}2026/01/img_7091-1187x1536.webp`,
  'rivn-research-2/tirzepatide/vial/10000': `${RIVN_UPLOADS}2026/01/img_7096-1187x1536.webp`,
  'rivn-research-2/tirzepatide/vial/30000': `${RIVN_UPLOADS}2026/01/img_7095-1187x1536.webp`,
  'rivn-research-2/tirzepatide/vial/60000': `${RIVN_UPLOADS}2026/01/img_1502.webp`,
  'rivn-research-2/semaglutide/vial/10000': `${RIVN_UPLOADS}2026/01/img_1507.webp`,
  'rivn-research-2/semaglutide/vial/20000': `${RIVN_UPLOADS}2026/01/img_1507.webp`,
  'rivn-research-2/cagrilintide/vial/10000': `${RIVN_UPLOADS}2026/01/img_1505.webp`,
  'rivn-research-2/ipamorelin/vial/10000': `${RIVN_UPLOADS}2026/01/img_4637.webp`,
  'rivn-research-2/tesamorelin/vial/5000': `${RIVN_UPLOADS}2026/01/img_0364.webp`,
  'rivn-research-2/tesamorelin/vial/10000': `${RIVN_UPLOADS}2026/03/img_7098-1187x1536.webp`,
  'rivn-research-2/sermorelin/vial/10000': `${RIVN_UPLOADS}2026/01/img_1504.webp`,
  'rivn-research-2/nad/vial/500000': `${RIVN_UPLOADS}2026/01/img_1495.webp`,
  'rivn-research-2/nad/vial/1000000': `${RIVN_UPLOADS}2026/01/img_7088-1187x1536.webp`,
  'rivn-research-2/mots-c/vial/10000': `${RIVN_UPLOADS}2026/01/img_0416.webp`,
  'rivn-research-2/mots-c/vial/40000': `${RIVN_UPLOADS}2026/01/img_7089-1187x1536.webp`,
  'rivn-research-2/epitalon/vial/10000': `${RIVN_UPLOADS}2026/01/img_0370.webp`,
  'rivn-research-2/semax/vial/10000': `${RIVN_UPLOADS}2026/01/img_0368.webp`,
  'rivn-research-2/selank/vial/10000': `${RIVN_UPLOADS}2026/01/img_0369.webp`,
  'rivn-research-2/pt-141/vial/10000': `${RIVN_UPLOADS}2026/01/img_4628.webp`,
  'rivn-research-2/5-amino-1mq/vial/10000': `${RIVN_UPLOADS}2026/01/img_0372.webp`,
  'rivn-research-2/ss-31-elamipretide/vial/10000': `${RIVN_UPLOADS}2026/05/img_4630.webp`,
  'rivn-research-2/dsip/vial/5000': `${RIVN_UPLOADS}2026/04/img_4633.webp`,
  'rivn-research-2/glutathione/vial/600000': `${RIVN_UPLOADS}2026/01/img_1496.webp`,
  'rivn-research-2/melanotan-2/vial/10000': `${RIVN_UPLOADS}2026/01/img_1500.webp`,
  'rivn-research-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${RIVN_UPLOADS}2026/01/img_7085-1187x1536.webp`,
  'rivn-research-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${RIVN_UPLOADS}2026/01/img_1503.webp`,
  'rivn-research-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${RIVN_UPLOADS}2026/01/img_1499.webp`,

  // Pristine Aminos
  // No general COA page was supplied for this vendor; only listings with their own certificate are
  // linked here. The vendor lists one certificate for both GHK-Cu sizes, all four Retatrutide sizes,
  // all four Tirzepatide sizes, and both Glutathione sizes.
  'pristine-aminos-2/bpc-157-tb-500/vial/20000': `${PRISTINE_UPLOADS}2026/09/wolverinebpc-157-tb-500-20mg-10-10-20260812-7.pdf`,
  'pristine-aminos-2/ghk-cu/vial/50000': `${PRISTINE_UPLOADS}2026/09/ghk-cu-100mg-260807-4.pdf`,
  'pristine-aminos-2/ghk-cu/vial/100000': `${PRISTINE_UPLOADS}2026/09/ghk-cu-100mg-260807-4.pdf`,
  'pristine-aminos-2/retatrutide/vial/10000': `${PRISTINE_UPLOADS}2026/09/glp3-r-10mg-btch-pe-99-334.pdf`,
  'pristine-aminos-2/retatrutide/vial/20000': `${PRISTINE_UPLOADS}2026/09/glp3-r-10mg-btch-pe-99-334.pdf`,
  'pristine-aminos-2/retatrutide/vial/30000': `${PRISTINE_UPLOADS}2026/09/glp3-r-10mg-btch-pe-99-334.pdf`,
  'pristine-aminos-2/retatrutide/vial/60000': `${PRISTINE_UPLOADS}2026/09/glp3-r-10mg-btch-pe-99-334.pdf`,
  'pristine-aminos-2/tirzepatide/vial/10000': `${PRISTINE_UPLOADS}2026/09/glp2-t-60mg-20260819-2.pdf`,
  'pristine-aminos-2/tirzepatide/vial/20000': `${PRISTINE_UPLOADS}2026/09/glp2-t-60mg-20260819-2.pdf`,
  'pristine-aminos-2/tirzepatide/vial/30000': `${PRISTINE_UPLOADS}2026/09/glp2-t-60mg-20260819-2.pdf`,
  'pristine-aminos-2/tirzepatide/vial/60000': `${PRISTINE_UPLOADS}2026/09/glp2-t-60mg-20260819-2.pdf`,
  'pristine-aminos-2/semaglutide/vial/10000': `${PRISTINE_UPLOADS}2026/09/glp1-s-10mg-20260807-5.pdf`,
  'pristine-aminos-2/tesamorelin/vial/10000': `${PRISTINE_UPLOADS}2026/09/tesamorelin-10mg-20260706-006.pdf`,
  'pristine-aminos-2/nad/vial/500000': `${PRISTINE_UPLOADS}2026/09/nad-500mg-batch.pdf`,
  'pristine-aminos-2/nad/vial/1000000': `${PRISTINE_UPLOADS}2026/09/nad-1000mg-batch.pdf`,
  'pristine-aminos-2/mots-c/vial/10000': `${PRISTINE_UPLOADS}2026/09/mots-c-10mg-20260702-001.pdf`,
  'pristine-aminos-2/selank/vial/10000': `${PRISTINE_UPLOADS}2026/09/selank-10mg-kizn072426.pdf`,
  'pristine-aminos-2/5-amino-1mq/vial/10000': `${PRISTINE_UPLOADS}2026/09/5-amino-1mq-50mg-kizen72826.pdf`,
  'pristine-aminos-2/ss-31-elamipretide/vial/50000': `${PRISTINE_UPLOADS}2026/09/ss-31-50mg-260807-1.pdf`,
  'pristine-aminos-2/glutathione/vial/1500000': `${PRISTINE_UPLOADS}2026/09/glutathione-1500mg-batch.pdf`,
  'pristine-aminos-2/glutathione/vial/3000000': `${PRISTINE_UPLOADS}2026/09/glutathione-1500mg-batch.pdf`,
  'pristine-aminos-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${PRISTINE_UPLOADS}2026/09/glow-70mg-20260813-3.pdf`,
  'pristine-aminos-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${PRISTINE_UPLOADS}2026/09/cjc-1295-ipamorelinno-dac-10mg-5-5-batch.pdf`,

  // Cielo Crew
  // No general COA page was supplied for this vendor; only listings with their own certificate are
  // linked here. Retatrutide, KLOW and the water came with no certificate. The BPC-157 + TB-500
  // blend's certificate is shared with its Wolverine listing, the same product under both compounds.
  'cielo-crew-2/bpc-157/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-005-1.jpg`,
  'cielo-crew-2/tb-500/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-006.jpg`,
  'cielo-crew-2/bpc-157-tb-500/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-003-1.jpg`,
  'cielo-crew-2/wolverine/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-003-1.jpg`,
  'cielo-crew-2/ghk-cu/vial/100000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-020-1.jpg`,
  'cielo-crew-2/tirzepatide/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-008-1.jpg`,
  'cielo-crew-2/semaglutide/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-013-1.jpg`,
  'cielo-crew-2/ipamorelin/vial/5000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-010-1.jpg`,
  'cielo-crew-2/tesamorelin/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-014-1.jpg`,
  'cielo-crew-2/sermorelin/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-007.jpg`,
  'cielo-crew-2/nad/vial/500000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-001-1.jpg`,
  'cielo-crew-2/mots-c/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-012-1.jpg`,
  'cielo-crew-2/semax/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-016.jpg`,
  'cielo-crew-2/glutathione/vial/1500000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-002-1.jpg`,
  'cielo-crew-2/melanotan-2/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-018-1.jpg`,
  'cielo-crew-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-009-1.jpg`,
  'cielo-crew-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${CIELO_UPLOADS}2026/04/V260318-4-Wholesale-Peptide-Supply-Report-017.jpg`,

  // Ares Research Lab
  // Each product page has its own COA link, shared across all sizes of that product.
  'ares-research-lab-2/bpc-157/vial/5000': `${ARES_COA}bpc-157&ref=peplookup`,
  'ares-research-lab-2/bpc-157/vial/10000': `${ARES_COA}bpc-157&ref=peplookup`,
  'ares-research-lab-2/bpc-157/vial/20000': `${ARES_COA}bpc-157&ref=peplookup`,
  // Sold as "GLP-2T"; the vendor lists this as their Tirzepatide product.
  'ares-research-lab-2/tirzepatide/vial/5000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/tirzepatide/vial/10000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/tirzepatide/vial/15000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/tirzepatide/vial/20000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/tirzepatide/vial/30000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/tirzepatide/vial/40000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/tirzepatide/vial/50000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/tirzepatide/vial/60000': `${ARES_COA}glp-2t&ref=peplookup`,
  'ares-research-lab-2/cjc-1295-no-dac/vial/2000': `${ARES_COA}cjc-1295-no-dac&ref=peplookup`,
  'ares-research-lab-2/cjc-1295-no-dac/vial/5000': `${ARES_COA}cjc-1295-no-dac&ref=peplookup`,
  'ares-research-lab-2/cjc-1295-no-dac/vial/10000': `${ARES_COA}cjc-1295-no-dac&ref=peplookup`,
  'ares-research-lab-2/tesamorelin/vial/2000': `${ARES_COA}tesamorelin&ref=peplookup`,
  'ares-research-lab-2/tesamorelin/vial/5000': `${ARES_COA}tesamorelin&ref=peplookup`,
  'ares-research-lab-2/tesamorelin/vial/10000': `${ARES_COA}tesamorelin&ref=peplookup`,
  'ares-research-lab-2/tesamorelin/vial/20000': `${ARES_COA}tesamorelin&ref=peplookup`,
  'ares-research-lab-2/nad/vial/100000': `${ARES_COA}nad-plus&ref=peplookup`,
  'ares-research-lab-2/nad/vial/500000': `${ARES_COA}nad-plus&ref=peplookup`,
  'ares-research-lab-2/nad/vial/1000000': `${ARES_COA}nad-plus&ref=peplookup`,
  'ares-research-lab-2/glutathione/vial/500000': `${ARES_COA}glutathione&ref=peplookup`,
  'ares-research-lab-2/glutathione/vial/1500000': `${ARES_COA}glutathione&ref=peplookup`,
  'ares-research-lab-2/selank/vial/5000': `${ARES_COA}selank&ref=peplookup`,
  'ares-research-lab-2/selank/vial/10000': `${ARES_COA}selank&ref=peplookup`,
  'ares-research-lab-2/semax/spray/150000': `${ARES_COA}semax-nasal&ref=peplookup`,
  'ares-research-lab-2/survodutide/vial/5000': `${ARES_COA}survodutide&ref=peplookup`,
  'ares-research-lab-2/survodutide/vial/10000': `${ARES_COA}survodutide&ref=peplookup`,
  'ares-research-lab-2/survodutide/vial/15000': `${ARES_COA}survodutide&ref=peplookup`,
  'ares-research-lab-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${ARES_COA}klow-stack&ref=peplookup`,

  // Blue Ridge Peptides
  // Only this listing came with its own certificate; every other listing uses the general testing page below.
  'blue-ridge-peptides-2/5-amino-1mq/vial/50000':
    'https://blueridgepeptides.com/wp-content/uploads/2026/03/Blue2607230638-2-pdf.jpg?coupon=products',

  // Nura Peptide
  // Each product page has its own certificate image, shared across all sizes of that product.
  'nura-peptide-2/tb-500/vial/5000': 'https://nurapeptide.com/product/thymosin-beta/?ref=153',
  'nura-peptide-2/ghk-cu/vial/100000': `${NURA_UPLOADS}2026/04/GHK-CU.webp?ref=153`,
  // Sold as "GLP-3R"; the vendor lists this as their Retatrutide product.
  'nura-peptide-2/retatrutide/vial/10000': `${NURA_UPLOADS}2026/05/img_7467.webp?ref=153`,
  'nura-peptide-2/retatrutide/vial/20000': `${NURA_UPLOADS}2026/05/img_7467.webp?ref=153`,
  'nura-peptide-2/retatrutide/vial/30000': `${NURA_UPLOADS}2026/05/img_7467.webp?ref=153`,
  'nura-peptide-2/retatrutide/vial/50000': `${NURA_UPLOADS}2026/05/img_7467.webp?ref=153`,
  // Sold as "GLP-2T"; the vendor lists this as their Tirzepatide product.
  'nura-peptide-2/tirzepatide/vial/10000': `${NURA_UPLOADS}2026/04/img_6704.webp?ref=153`,
  'nura-peptide-2/tirzepatide/vial/30000': `${NURA_UPLOADS}2026/04/img_6704.webp?ref=153`,
  'nura-peptide-2/tirzepatide/vial/60000': `${NURA_UPLOADS}2026/04/img_6704.webp?ref=153`,
  // Sold as "GLP-1SG"; the vendor lists this as their Semaglutide product.
  'nura-peptide-2/semaglutide/vial/10000': `${NURA_UPLOADS}2026/04/img_2552-768x950.webp?ref=153`,
  'nura-peptide-2/tesamorelin/vial/10000': `${NURA_UPLOADS}2026/04/TESAMORELIN.webp?ref=153`,
  'nura-peptide-2/tesamorelin/vial/20000': `${NURA_UPLOADS}2026/04/TESAMORELIN.webp?ref=153`,
  'nura-peptide-2/nad/vial/500000': `${NURA_UPLOADS}2026/04/img_2560.webp?ref=153`,
  'nura-peptide-2/nad/vial/1000000': `${NURA_UPLOADS}2026/04/img_2560.webp?ref=153`,
  'nura-peptide-2/mots-c/vial/10000': `${NURA_UPLOADS}2026/04/img_5043.webp?ref=153`,
  'nura-peptide-2/semax/vial/10000': `${NURA_UPLOADS}2026/04/IMG_5768.webp?ref=153`,
  'nura-peptide-2/semax/spray/10000': `${NURA_UPLOADS}2026/04/IMG_5768.webp?ref=153`,
  'nura-peptide-2/selank/spray/10000': `${NURA_UPLOADS}2026/04/SELANK.webp?ref=153`,
  'nura-peptide-2/pt-141/spray/10000': `${NURA_UPLOADS}2026/05/Screenshot-2026-05-18-at-2.12.50-PM-768x992.webp?ref=153`,
  'nura-peptide-2/5-amino-1mq/vial/10000': `${NURA_UPLOADS}2026/04/5-AMINO.webp?ref=153`,
  'nura-peptide-2/5-amino-1mq/vial/50000': `${NURA_UPLOADS}2026/04/5-AMINO.webp?ref=153`,
  'nura-peptide-2/glutathione/vial/1500000': `${NURA_UPLOADS}2026/04/GLUTATHIONE.webp?ref=153`,
  'nura-peptide-2/cjc-1295-no-dac/vial/5000': `${NURA_UPLOADS}2026/04/Screenshot-2026-04-16-at-12.31.11-PM.webp?ref=153`,
  'nura-peptide-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${NURA_UPLOADS}2026/04/GLOW-752x1024.webp?ref=153`,
  'nura-peptide-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${NURA_UPLOADS}2026/04/KLOW-2.webp?ref=153`,
  'nura-peptide-2/ipamorelin-cjc-1295-no-dac/vial/10000': `${NURA_UPLOADS}2026/04/IPACJC-768x1056.png?ref=153`,
  'nura-peptide-2/wolverine/vial/10000': `${NURA_UPLOADS}2026/04/BPCTB5-767x1024.webp?ref=153`,
  'nura-peptide-2/wolverine/vial/20000': `${NURA_UPLOADS}2026/04/BPCTB5-767x1024.webp?ref=153`,

  // Apex Peptides Lab
  // Each product page has its own certificate image, shared across all sizes of that product.
  // SS-31, DSIP, GLOW and Bacteriostatic Water came with no certificate.
  'apex-peptides-lab-2/bpc-157/vial/5000': `${APEX_CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/bpc-157/vial/10000': `${APEX_CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/bpc-157/vial/20000': `${APEX_CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tb-500/vial/5000': `${APEX_CMS}2025/08/thymosin-b-4-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tb-500/vial/10000': `${APEX_CMS}2025/08/thymosin-b-4-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/bpc-157-tb-500/vial/10000': `${APEX_CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/bpc-157-tb-500/vial/20000': `${APEX_CMS}2025/08/bpc-157-bepecin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/ghk-cu/vial/50000': `${APEX_CMS}2025/12/ghk-copper-50mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/ghk-cu/vial/100000': `${APEX_CMS}2025/12/ghk-copper-50mg.jpg?coupon=peplookup`,
  // Sold as "GLP-3 R"; the vendor lists this as their Retatrutide product.
  'apex-peptides-lab-2/retatrutide/vial/5000': `${APEX_CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/retatrutide/vial/10000': `${APEX_CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/retatrutide/vial/15000': `${APEX_CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/retatrutide/vial/20000': `${APEX_CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/retatrutide/vial/30000': `${APEX_CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/retatrutide/vial/60000': `${APEX_CMS}2025/08/retatrutide-5mg.jpg?coupon=peplookup`,
  // Sold as "GLP-1 T"; the vendor lists this as their Tirzepatide product.
  'apex-peptides-lab-2/tirzepatide/vial/5000': `${APEX_CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tirzepatide/vial/10000': `${APEX_CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tirzepatide/vial/15000': `${APEX_CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tirzepatide/vial/20000': `${APEX_CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tirzepatide/vial/30000': `${APEX_CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tirzepatide/vial/60000': `${APEX_CMS}2025/08/tirzepatide-5mg.jpg?coupon=peplookup`,
  // Sold as "GLP-1 S"; the vendor lists this as their Semaglutide product.
  'apex-peptides-lab-2/semaglutide/vial/2000': `${APEX_CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/semaglutide/vial/5000': `${APEX_CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/semaglutide/vial/10000': `${APEX_CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/semaglutide/vial/20000': `${APEX_CMS}2025/08/semaglutide-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/ipamorelin/vial/5000': `${APEX_CMS}2025/08/lpamorelin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tesamorelin/vial/5000': `${APEX_CMS}2025/08/tesamorelin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/tesamorelin/vial/10000': `${APEX_CMS}2025/08/tesamorelin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/sermorelin/vial/10000': `${APEX_CMS}2025/08/sermorelin-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/nad/vial/500000': `${APEX_CMS}2025/08/nad-500-mg.png?coupon=peplookup`,
  'apex-peptides-lab-2/nad/vial/1000000': `${APEX_CMS}2025/08/nad-500-mg.png?coupon=peplookup`,
  'apex-peptides-lab-2/mots-c/vial/10000': `${APEX_CMS}2025/09/mots-c-10mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/mots-c/vial/40000': `${APEX_CMS}2025/09/mots-c-10mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/epitalon/vial/5000': `${APEX_CMS}2025/09/epithalon-50-mg.png?coupon=peplookup`,
  'apex-peptides-lab-2/semax/vial/5000': `${APEX_CMS}2025/09/semax-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/semax/vial/10000': `${APEX_CMS}2025/09/semax-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/semax/vial/30000': `${APEX_CMS}2025/09/semax-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/selank/vial/5000': `${APEX_CMS}2025/09/selank-5mg-semax-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/pt-141/vial/10000': `${APEX_CMS}2025/08/pt-141-10mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/glutathione/vial/600000': `${APEX_CMS}2025/08/l-glutathione-600-mg.png?coupon=peplookup`,
  'apex-peptides-lab-2/glutathione/vial/1500000': `${APEX_CMS}2025/08/l-glutathione-600-mg.png?coupon=peplookup`,
  'apex-peptides-lab-2/melanotan-2/vial/10000': `${APEX_CMS}2025/09/melanotan-II-10mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/cjc-1295-no-dac/vial/5000': `${APEX_CMS}2025/08/cjc-1295-without-dac-5mg.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/cjc-1295-no-dac/vial/10000':
    `${APEX_CMS}2025/11/COA_CJC-1295_noDAC_10mg_2026-02-03_20260223-1-scaled.jpg?coupon=peplookup`,
  'apex-peptides-lab-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${APEX_CMS}2025/12/klow.jpg?coupon=peplookup`,

  // Alpha Pro Peptides
  // Per-batch certificate links; listings without one fall back to the general COA page below.
  'alpha-pro-peptides-2/bpc-157/vial/10000': 'https://alpha-peptides.com/BPC-42326428?ref=peplookup',
  'alpha-pro-peptides-2/tb-500/vial/10000': 'https://alpha-peptides.com/TB-42326428?ref=peplookup',
  'alpha-pro-peptides-2/bpc-157-tb-500/vial/20000': 'https://alpha-peptides.com/BPT-10261028?ref=peplookup',
  'alpha-pro-peptides-2/ghk-cu/vial/50000': 'https://alpha-peptides.com/GK-726728?ref=peplookup',
  'alpha-pro-peptides-2/ghk-cu/vial/100000': 'https://portal.ils-lab.com/verify/kW6uI-eaGnNrog1c',
  // Sold as "GLP-3-RT"; the vendor lists this as their Retatrutide product.
  'alpha-pro-peptides-2/retatrutide/vial/10000': 'https://alpha-peptides.com/R10-51826528?ref=peplookup',
  'alpha-pro-peptides-2/retatrutide/vial/15000': 'https://alpha-peptides.com/R15-32526328?ref=peplookup',
  'alpha-pro-peptides-2/retatrutide/vial/30000': 'https://alpha-peptides.com/R30-10261028?ref=peplookup',
  'alpha-pro-peptides-2/retatrutide/vial/50000': 'https://alpha-peptides.com/R50-32526328?ref=peplookup',
  // Sold as "GLP-2-TZ"; the vendor lists this as their Tirzepatide product.
  'alpha-pro-peptides-2/tirzepatide/vial/30000': 'https://alpha-peptides.com/T30-32526328?ref=peplookup',
  'alpha-pro-peptides-2/tirzepatide/vial/60000': 'https://alpha-peptides.com/T60-42326428?ref=peplookup',
  'alpha-pro-peptides-2/ipamorelin/vial/10000': 'https://alpha-peptides.com/IPA-10261028?ref=peplookup',
  'alpha-pro-peptides-2/tesamorelin/vial/10000': 'https://alpha-peptides.com/TM10-32526328?ref=peplookup',
  'alpha-pro-peptides-2/mots-c/vial/10000':
    'https://alpha-peptides.com/wp-content/uploads/2026/06/coa-mots-c-20260419.pdf?ref=peplookup',
  'alpha-pro-peptides-2/epitalon/vial/10000': 'https://alpha-peptides.com/EPI-10261028?ref=peplookup',
  'alpha-pro-peptides-2/semax/vial/10000': 'https://alpha-peptides.com/SX-10261028?ref=peplookup',
  'alpha-pro-peptides-2/selank/vial/10000': 'https://alpha-peptides.com/SL-726728?ref=peplookup',
  'alpha-pro-peptides-2/pt-141/vial/10000': 'https://alpha-peptides.com/PT-51826528?ref=peplookup',
  'alpha-pro-peptides-2/ss-31-elamipretide/vial/10000':
    'https://alpha-peptides.com/wp-content/uploads/2026/06/coa-ss-31-20260419.pdf?ref=peplookup',
  'alpha-pro-peptides-2/dsip/vial/5000': 'https://alpha-peptides.com/DS-42326428?ref=peplookup',
  'alpha-pro-peptides-2/dsip/vial/10000': 'https://alpha-peptides.com/DS-42326428?ref=peplookup',
  'alpha-pro-peptides-2/melanotan-2/vial/10000':
    'https://analyticalformulations.com/storage/v1/object/public/results/6t7cfrxkucqjksb52eapxagqt2c7gnz0_result_1774996957115.pdf',
  'alpha-pro-peptides-2/cjc-1295-no-dac/vial/5000': 'https://alpha-peptides.com/CND-10261028?ref=peplookup',
  'alpha-pro-peptides-2/cjc-1295-no-dac/vial/10000': 'https://alpha-peptides.com/CND-10261028?ref=peplookup',
  'alpha-pro-peptides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': 'https://alpha-peptides.com/GLW-32526328?ref=peplookup',
  'alpha-pro-peptides-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': 'https://alpha-peptides.com/KL-42326428?ref=peplookup',
  'alpha-pro-peptides-2/ipamorelin-cjc-1295-no-dac/vial/10000': 'https://alpha-peptides.com/CJI-10261028?ref=peplookup',

  // Averix Labs
  // Each listing came with its own certificate image or PDF; no general COA page was supplied.
  'averix-labs-2/bpc-157/vial/10000': `${AVERIX_UPLOADS}2026/07/BPC-157-10mg-BPC157-2601-A01.png${AVERIX_REF}`,
  'averix-labs-2/tb-500/vial/10000': `${AVERIX_UPLOADS}2026/07/TB-500-10MG-TB500-2601-A01.png${AVERIX_REF}`,
  'averix-labs-2/ghk-cu/vial/50000': 'https://app.horizonanalytical.com/api/public/certificates/p3tiXaMpvMwdwMYe4dIJv',
  'averix-labs-2/ghk-cu/vial/100000': 'https://app.horizonanalytical.com/api/public/certificates/2BUV3XOWb_p7On1hAoDT4',
  // Sold as "GLP3-RT"; the vendor lists this as their Retatrutide product.
  'averix-labs-2/retatrutide/vial/10000': 'https://app.horizonanalytical.com/api/public/certificates/aO_akADMeA0XDsVDnIOv-',
  'averix-labs-2/retatrutide/vial/20000': `${AVERIX_UPLOADS}2026/02/GLP-3R-20MG-RET-2601-A02.png${AVERIX_REF}`,
  'averix-labs-2/retatrutide/vial/30000': `${AVERIX_UPLOADS}2026/02/GLP-3R-30MG-RET-2601-A03.png${AVERIX_REF}`,
  // Sold as "GLP1-T"; the vendor lists this as their Tirzepatide product.
  'averix-labs-2/tirzepatide/vial/10000': `${AVERIX_UPLOADS}2026/02/GLP-1T-10MG-TRZ-2601-A01.png${AVERIX_REF}`,
  'averix-labs-2/tirzepatide/vial/20000': `${AVERIX_UPLOADS}2026/02/GLP-1T-20MG-TRZ-2601-A02.png${AVERIX_REF}`,
  'averix-labs-2/tirzepatide/vial/30000': `${AVERIX_UPLOADS}2026/02/GLP-1T-30MG-TRZ-2601-B01.png${AVERIX_REF}`,
  'averix-labs-2/tirzepatide/vial/60000': `${AVERIX_UPLOADS}2026/02/GLP-1T-60MG-TRZ-2601-B02.png${AVERIX_REF}`,
  'averix-labs-2/tesamorelin/vial/10000': `${AVERIX_UPLOADS}2026/07/Tesamorelin-10MG-TESA-2601-A01.png${AVERIX_REF}`,
  'averix-labs-2/nad/vial/500000': `${AVERIX_UPLOADS}2026/07/NAD-500MG-NAD-2601-A01.png${AVERIX_REF}`,
  'averix-labs-2/nad/vial/1000000': `${AVERIX_UPLOADS}2026/07/NAD-1000MG-NAD-2601-A02.png${AVERIX_REF}`,
  'averix-labs-2/mots-c/vial/10000': 'https://app.horizonanalytical.com/api/public/certificates/2vUjMyLYprYQkbpIC9NSn',
  'averix-labs-2/epitalon/vial/10000': `${AVERIX_UPLOADS}2026/07/Epitalon-10MG-EPIT-2602-A01.png${AVERIX_REF}`,
  'averix-labs-2/semax/vial/10000': `${AVERIX_UPLOADS}2026/07/Semax-10MG-SMX-2605-A01.png${AVERIX_REF}`,
  'averix-labs-2/selank/vial/10000': `${AVERIX_UPLOADS}2026/07/Selank-10MG-SLK-2605-A01_.png${AVERIX_REF}`,
  'averix-labs-2/pt-141/vial/10000': `${AVERIX_UPLOADS}2026/06/PT-141-PT141-2606-A01.png${AVERIX_REF}`,
  'averix-labs-2/5-amino-1mq/vial/50000': `${AVERIX_UPLOADS}2026/07/5-Amino-1MQ-50mg-AMQ-2607-A01.png${AVERIX_REF}`,
  'averix-labs-2/ss-31-elamipretide/vial/10000': `${AVERIX_UPLOADS}2026/07/SS-31-10MG-SS31-2601-A01.png${AVERIX_REF}`,
  'averix-labs-2/dsip/vial/10000': `${AVERIX_UPLOADS}2026/07/DSIP-10MG-DSIP-2602-A01.png${AVERIX_REF}`,
  'averix-labs-2/glutathione/vial/1200000': `${AVERIX_UPLOADS}2026/07/Glutathione-1200mg-GLUT-2607-A01.png${AVERIX_REF}`,
  'averix-labs-2/ahk-cu/vial/100000': `${AVERIX_UPLOADS}2026/07/AHK-Cu-100mg-AHKCU-2607-A01.png${AVERIX_REF}`,
  'averix-labs-2/melanotan-i/vial/10000': `${AVERIX_UPLOADS}2026/06/MT-1-MT1-2606-A01.png${AVERIX_REF}`,
  'averix-labs-2/melanotan-2/vial/10000': `${AVERIX_UPLOADS}2026/06/MT-2-MT2-2606-A01.png${AVERIX_REF}`,
  'averix-labs-2/glow-ghk-cu-bpc-157-tb-500/vial/70000':
    'https://app.horizonanalytical.com/api/public/certificates/vyR0cPr1f7mW5dzdhAuOL',
  'averix-labs-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000':
    `${AVERIX_UPLOADS}2026/07/KLOW-Blend-80mg-KLOW-2601-A01.png${AVERIX_REF}`,
  'averix-labs-2/ipamorelin-cjc-1295-no-dac/vial/10000':
    `${AVERIX_UPLOADS}2026/07/CJC-1295-NO-DAC-_-Ipamorelin.png${AVERIX_REF}`,
  'averix-labs-2/wolverine/vial/10000': `${AVERIX_UPLOADS}2026/07/Wolverine-Blend-10mg-WOLV-2607-A01.png${AVERIX_REF}`,

  // MsAmino
  // Per-batch certificate images; 5-Amino-1MQ Capsules, SS-31, Dihexa Capsules, CJC-1295 No DAC 10mg
  // and Bacteriostatic Water came with no certificate.
  'msamino-2/bpc-157/vial/5000': `${MSAMINO_COAS}bpc-157/1786324327230-f49f590a098d.jpg${MSAMINO_REF}`,
  'msamino-2/bpc-157/vial/10000': `${MSAMINO_COAS}bpc-157/1786324320461-d38a3c97c699.jpg${MSAMINO_REF}`,
  'msamino-2/tb-500/vial/5000': `${MSAMINO_COAS}tb500/1786325570349-2c89c40defc5.jpg${MSAMINO_REF}`,
  'msamino-2/tb-500/vial/10000': `${MSAMINO_COAS}tb500/1786325579657-cd2aebc0325c.jpg${MSAMINO_REF}`,
  'msamino-2/bpc-157-tb-500/vial/10000': `${MSAMINO_COAS}bpc-157-tb-500-blend-10mg-10mg/1786324392034-f5e3e12a2dca.jpg${MSAMINO_REF}`,
  'msamino-2/bpc-157-tb-500/vial/20000': `${MSAMINO_COAS}bpc-157-tb-500-blend-10mg-10mg/1786324392034-f5e3e12a2dca.jpg${MSAMINO_REF}`,
  'msamino-2/ghk-cu/vial/50000': `${MSAMINO_COAS}ghk-cu/1786324708293-765006946c34.jpg${MSAMINO_REF}`,
  'msamino-2/ghk-cu/vial/100000': `${MSAMINO_COAS}ghk-cu/1786324699295-22f7730c3f07.jpg${MSAMINO_REF}`,
  // Sold as "GLP-3-RT"; the vendor lists this as their Retatrutide product.
  'msamino-2/retatrutide/vial/20000': `${MSAMINO_COAS}glp-3-rt/1786324860708-3db36390f7b7.jpg${MSAMINO_REF}`,
  'msamino-2/retatrutide/vial/30000': `${MSAMINO_COAS}glp-3-rt/1786324849803-33348ac69c07.jpg${MSAMINO_REF}`,
  // Sold as "GLP-2-Tirz"; the vendor lists this as their Tirzepatide product.
  'msamino-2/tirzepatide/vial/10000': `${MSAMINO_COAS}glp-2-tirz/1786324769460-7e477e5c3dd0.jpg${MSAMINO_REF}`,
  'msamino-2/tirzepatide/vial/30000': `${MSAMINO_COAS}glp-2-tirz/1786324763902-3b918f7e5656.jpg${MSAMINO_REF}`,
  'msamino-2/tirzepatide/vial/40000': `${MSAMINO_COAS}glp-2-tirz/1786324783638-6163ac3277be.jpg${MSAMINO_REF}`,
  'msamino-2/tirzepatide/vial/60000': `${MSAMINO_COAS}glp-2-tirz/1786324788650-0cf4937da365.jpg${MSAMINO_REF}`,
  'msamino-2/semaglutide/vial/5000': `${MSAMINO_COAS}semaglutide/1786325716593-f0d577f2744b.jpg${MSAMINO_REF}`,
  'msamino-2/semaglutide/vial/10000': `${MSAMINO_COAS}semaglutide/1786325708744-89e27379be1e.jpg${MSAMINO_REF}`,
  'msamino-2/semaglutide/vial/20000': `${MSAMINO_COAS}semaglutide/1786330023416-f55d59502e3e.jpg${MSAMINO_REF}`,
  'msamino-2/cagrilintide/vial/5000': `${MSAMINO_COAS}cagrilintide/1786324583801-d136b1c74156.jpg${MSAMINO_REF}`,
  'msamino-2/cagrilintide/vial/10000': `${MSAMINO_COAS}cagrilintide/1786324575912-b47dc6dfcdef.jpg${MSAMINO_REF}`,
  'msamino-2/ipamorelin/vial/5000': `${MSAMINO_COAS}ipamorelin-5mg/1786325142325-7a06ac03235e.jpg${MSAMINO_REF}`,
  'msamino-2/ipamorelin/vial/10000': `${MSAMINO_COAS}ipamorelin-5mg/1786325142325-7a06ac03235e.jpg${MSAMINO_REF}`,
  'msamino-2/tesamorelin/vial/10000': `${MSAMINO_COAS}tesamorelin-10mg/1786325540821-787d99f4859d.jpg${MSAMINO_REF}`,
  'msamino-2/sermorelin/vial/10000': `${MSAMINO_COAS}sermorelin-10mg/1786325625173-ad63a49bd7d4.jpg${MSAMINO_REF}`,
  'msamino-2/nad/vial/500000': `${MSAMINO_COAS}nad-500mg/1786325462458-a54c4bd7c34c.jpg${MSAMINO_REF}`,
  'msamino-2/mots-c/vial/10000': `${MSAMINO_COAS}mots-c-10mg/1786325343237-18f8f60c2252.jpg${MSAMINO_REF}`,
  'msamino-2/mots-c/vial/40000': `${MSAMINO_COAS}mots-c-10mg/1786325343237-18f8f60c2252.jpg${MSAMINO_REF}`,
  'msamino-2/epitalon/vial/10000': `${MSAMINO_COAS}epithalon-10mg/1786324659941-93e72e2af283.jpg${MSAMINO_REF}`,
  'msamino-2/epitalon/vial/50000': `${MSAMINO_COAS}epithalon-10mg/1786324659941-93e72e2af283.jpg${MSAMINO_REF}`,
  'msamino-2/semax/vial/10000': `${MSAMINO_COAS}semax-10mg/1786325661480-e2bfd820a64f.jpg${MSAMINO_REF}`,
  'msamino-2/selank/vial/10000': `${MSAMINO_COAS}selank/1786325849951-5efb5abd9c62.jpg${MSAMINO_REF}`,
  'msamino-2/pt-141/vial/10000': `${MSAMINO_COAS}pt-141-10mg/1786325496061-72ef198ca544.jpg${MSAMINO_REF}`,
  'msamino-2/5-amino-1mq/vial/10000': `${MSAMINO_COAS}5-amino-imq-10mg/1786324198346-5968b04e07a1.jpg${MSAMINO_REF}`,
  'msamino-2/dsip/vial/10000': `${MSAMINO_COAS}dsip-10mg/1786324626874-a59b007dd44b.jpg${MSAMINO_REF}`,
  'msamino-2/glutathione/vial/750000': `${MSAMINO_COAS}glutathione-750mg/1786325013410-21a7621598fd.jpg${MSAMINO_REF}`,
  'msamino-2/melanotan-2/vial/10000': `${MSAMINO_COAS}mt-2-melanotan-ii-10mg/1786325393591-9130cdbc1fe9.jpg${MSAMINO_REF}`,
  'msamino-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${MSAMINO_COAS}glow-blend-70mg/1786324960148-76f65a131c60.jpg${MSAMINO_REF}`,
  'msamino-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${MSAMINO_COAS}klow-80mg/1786325244110-898ad4fa107d.jpg${MSAMINO_REF}`,
  'msamino-2/ipamorelin-cjc-1295-no-dac/vial/10000':
    `${MSAMINO_COAS}cjc-1295-ipamorelin-no-dac/1786324491586-cb1a05401885.jpg${MSAMINO_REF}`,

  // Qureshi Labs
  // Only GHK-Cu and Retatrutide came with a certificate; every other listing had none supplied.
  'qureshi-labs-2/ghk-cu/vial/100000': `${QURESHI_IMAGES}2026/03/GHK-cu-COA-1.png${QURESHI_REF}`,
  // Sold as "QL3-RT"; the vendor lists this as their Retatrutide product.
  'qureshi-labs-2/retatrutide/vial/5000': `${QURESHI_IMAGES}2026/03/GLP-3-RT-COA-1.png${QURESHI_REF}`,
  'qureshi-labs-2/retatrutide/vial/10000': `${QURESHI_IMAGES}2026/03/GLP-3-RT-COA-1.png${QURESHI_REF}`,
  'qureshi-labs-2/retatrutide/vial/20000': `${QURESHI_IMAGES}2026/03/GLP-3-RT-COA-1.png${QURESHI_REF}`,
  'qureshi-labs-2/retatrutide/vial/40000': `${QURESHI_IMAGES}2026/03/GLP-3-RT-COA-1.png${QURESHI_REF}`,

  // Amino Science
  // Per-batch certificates where supplied; listings without one fall back to the general COA page below.
  'amino-science-2/bpc-157/vial/10000': `${AS_COAS}bpc-157-10mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/tb-500/vial/10000': `${AS_COAS}tb500-10mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/bpc-157-tb-500/vial/10000': `${AS_COAS}bpc-157-tb-500-blend-5mg-5mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/ghk-cu/vial/50000': `${AS_COAS}ghk-cu-50mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/ghk-cu/vial/100000': `${AS_COAS}ghk-cu-100mg-coa.jpg?${AS_DPL1}`,
  // Sold as "AS3-RT"; the vendor lists this as their Retatrutide product.
  'amino-science-2/retatrutide/vial/10000': `${AS_COAS}as3-rt-10mg-coa.jpg?${AS_DPL3}`,
  'amino-science-2/retatrutide/vial/20000': `${AS_COAS}as3-rt-20mg-coa.jpg?${AS_DPL3}`,
  'amino-science-2/retatrutide/vial/30000': `${AS_COAS}as3-rt-30mg-coa.jpg?${AS_DPL3}`,
  // Sold as "GLP-2" (AS2-TZ); the vendor lists this as their Tirzepatide product.
  'amino-science-2/tirzepatide/vial/10000': `${AS_COAS}as2-tz-10mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/tirzepatide/vial/30000': `${AS_COAS}as2-tz-30mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/tirzepatide/vial/60000': `${AS_COAS}as2-tz-60mg-coa.jpg?${AS_DPL2}`,
  // Sold as "GLP-1"; the vendor lists this as their Semaglutide product.
  'amino-science-2/semaglutide/vial/5000': `${AS_COAS}semaglutide-5mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/semaglutide/vial/10000': `${AS_COAS}semaglutide-10mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/semaglutide/vial/20000': `${AS_COAS}semaglutide-20mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/cagrilintide/vial/10000': `${AS_COAS}cagrilintide-10mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/ipamorelin/vial/5000': `${AS_COAS}ipamorelin-5mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/tesamorelin/vial/10000': `${AS_COAS}tesamorelin-10mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/sermorelin/vial/10000': `${AS_COAS}sermorelin-10mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/nad/vial/500000': `${AS_COAS}nad-500mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/nad/spray/500000': `${AS_COAS}nad-500mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/mots-c/vial/10000': `${AS_COAS}mots-c-10mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/selank/vial/10000': `${AS_COAS}selank-10mg-coa.jpg?${AS_DPL4}`,
  'amino-science-2/selank/spray/10000': `${AS_COAS}selank-10mg-coa.jpg?${AS_DPL4}`,
  'amino-science-2/pt-141/vial/10000': `${AS_COAS}pt-141-10mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/pt-141/spray/10000': `${AS_COAS}pt-141-10mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/5-amino-1mq/vial/10000': `${AS_COAS}5-amino-imq-10mg-coa.jpg?${AS_DPL2}`,
  'amino-science-2/glow-ghk-cu-bpc-157-tb-500/vial/70000': `${AS_COAS}glow-blend-70mg-coa.jpg?${AS_DPL1}`,
  'amino-science-2/klow-bpc-157-tb-500-kpv-ghk-cu/vial/80000': `${AS_COAS}klow-80mg-coa.jpg?${AS_DPL1}`,

  // AminoVault
  // GHK-Cu, Retatrutide and Tirzepatide came with their own certificate PDF; every other listing
  // uses the vendor's general lab-tests page (VENDOR_COA_PAGES below).
  'aminovault-2/ghk-cu/vial/100000': 'https://aminovault.com/wp-content/uploads/2026/02/GHK_Cu.pdf?ref=112',
  'aminovault-2/retatrutide/vial/10000':
    'https://aminovault.com/wp-content/uploads/2025/07/COA-251462-QC251075-Retatrutide.pdf?ref=112',
  'aminovault-2/retatrutide/vial/20000':
    'https://aminovault.com/wp-content/uploads/2025/07/COA-251462-QC251075-Retatrutide.pdf?ref=112',
  'aminovault-2/retatrutide/vial/30000':
    'https://aminovault.com/wp-content/uploads/2025/07/COA-251462-QC251075-Retatrutide.pdf?ref=112',
  'aminovault-2/tirzepatide/vial/10000':
    'https://aminovault.com/wp-content/uploads/2025/07/COA-251464-QC250877-Tirzepatide.pdf?ref=112',
  'aminovault-2/tirzepatide/vial/20000':
    'https://aminovault.com/wp-content/uploads/2025/07/COA-251464-QC250877-Tirzepatide.pdf?ref=112',

  // Rejuven8 Peptides
  // These five listings came with their own certificate PDF; every other listing uses the general
  // certificates page (VENDOR_COA_PAGES below).
  'rejuven8-peptides-2/bpc-157/vial/5000': `${REJUVEN8_UPLOADS}2025/10/Reju2601290042.pdf${REJUVEN8_REF}`,
  'rejuven8-peptides-2/bpc-157/vial/10000': `${REJUVEN8_UPLOADS}2025/10/Reju2601290043.pdf${REJUVEN8_REF}`,
  'rejuven8-peptides-2/bpc-157-tb-500/vial/10000': `${REJUVEN8_UPLOADS}2026/01/Reju2606240246.pdf${REJUVEN8_REF}`,
  'rejuven8-peptides-2/bpc-157-tb-500/vial/20000': `${REJUVEN8_UPLOADS}2026/01/Reju2606240245.pdf${REJUVEN8_REF}`,
  'rejuven8-peptides-2/glow-ghk-cu-bpc-157-tb-500/vial/70000':
    `${REJUVEN8_UPLOADS}2025/10/Reju2606240247.pdf${REJUVEN8_REF}`,
};

/**
 * Vendors that publish one general COA page instead of a certificate per
 * listing, supplied as the COA for every one of their listings. Used only
 * where the listing has no certificate of its own above.
 */
const VENDOR_COA_PAGES: Readonly<Record<string, string>> = {
  'amino-club-2': 'https://www.aminoclub.com/us/coa',
  'prpeps-2': 'https://prpeps.com/coa',
  'renova-peptides-2': 'https://renovapeptides.net/certificates/',
  'pepvida-labs-2': 'https://pepvidalabs.com/certificates-of-analysis/',
  'reta-one-labs-2': 'https://retaonelabs.com/coa/',
  'gen-peptide-2': 'https://genpeptide.com/coa-lookup/',
  'la-peptides-2': 'https://lapeptides.net/product-certificates/',
  'ascension-peptides-2': 'https://ascensionpeptides.com/certificates-of-analysis/',
  'bioinfinity-2': 'https://www.bioinfinity.co/coa-library/',
  'biopeptide-technologies-2': 'https://biopeptitech.com/pages/coa',
  'bionova-peptides-2': 'https://bionovapeptides.com/lab-results/',
  'kalyx-labs-2': 'https://hlxlabs.shop/coas/',
  'hlx-labs-2': 'https://hlxlabs.shop/coas/',
  'trusted-peps-2': 'https://trustedpeps.us/coas/',
  'sparta-labs-2': 'https://spartalabs.net/us/lab-results',
  'nextgen-peps-2': 'https://nextgenpeps.com/coa-library/',
  'peptixa-labs-2': 'https://peptixalabs.com/coas-and-research/?ic=ADAMD',
  'pivot-labs-2': 'https://pivotlabsglobal.com/coa/?ref=peplookup',
  'crystal-peptides-2': 'https://crystalpeptides.eu/coa?ref=PEPLOOKUP',
  'peppy-me-2': 'https://peppyandme.com/coa/?ref=peplookup',
  'blue-ridge-peptides-2': 'https://blueridgepeptides.com/testing/?coupon=products',
  'offline-peptides-2': 'https://offlinepeptides.com/coa/?ref=adamdan6688',
  'main-peptides-2': 'https://mainpeptides.com/?ref=AdamDan6688',
  'alpha-pro-peptides-2': 'https://alpha-peptides.com/coas/?ref=peplookup',
  'true-research-labs-2': 'https://trueresearchlabs.com/coa/?ref=peplookup',
  'amino-science-2': 'https://aminoscience.io/coas?ref=PRODUCTS',
  'purgo-labs-2': 'https://www.purgolabs.com/lab-reports?ref=PEPLOOKUP',
  'aminovault-2': 'https://aminovault.com/lab-tests/?ref=112',
  'ramp-peptides-2': 'https://ramppeptides.com/coas/?coupon=products',
  'palmetto-peptides-2': 'https://palmettopeptides.com/coa?ref=PRODUCTS',
  'blank-peptides-2': 'https://blankpeptides.com/coas/?ref=peplookup',
  'true-peptides-2': 'https://true-peptides.com/coas?ref=products',
  '99-purity-peptides-2': 'https://99puritypeptides.com/certificates?ref=adam-dan',
  'peak-lab-peptides-2': 'https://peaklabpeptides.com/certificate-of-analysis/?afref=a1n9',
  'peptide-giants-2': 'https://peptidegiants.com/lab-reports/?ref=peplookup',
  'nupeps-2': 'https://nupeps.com/peptide-coas/?ref=23',
  'elite-research-lab-2': 'https://www.eliteresearchlab.com/coa-labs/?ref=peplookup',
  'rejuven8-peptides-2': 'https://rejuven8peptides.com/certificates/?aff=peplookup',
  'idun-peptides-2': 'https://idunpeptides.com/coas/?ref=PEPLOOKUP',
};

/**
 * `previousSlugs` are the vendor's slugs from before a rename in /admin/seo:
 * the maps above are keyed by the slug each link was written for, so without
 * them a renamed vendor would lose every published COA link.
 */
export function publishedCoaLink(
  offer: Pick<Offer, 'supplierSlug' | 'productSlug' | 'form' | 'vialSize'>,
  previousSlugs: readonly string[] = [],
): string | null {
  const slugs = [offer.supplierSlug, ...previousSlugs];
  // A listing's own certificate still beats the vendor's general COA page.
  for (const slug of slugs) {
    const link = COA_LINKS[`${slug}/${offer.productSlug}/${offer.form}/${offer.vialSize}`];
    if (link) return link;
  }
  for (const slug of slugs) {
    const page = VENDOR_COA_PAGES[slug];
    if (page) return page;
  }
  return null;
}

export function withPublishedCoaLink(offer: Offer, previousSlugs: readonly string[] = []): Offer {
  if (offer.coaUrl) return offer;
  const coaUrl = publishedCoaLink(offer, previousSlugs);
  return coaUrl ? { ...offer, coaUrl } : offer;
}
