import { site } from '@/config/site';

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Built-in FAQs, shown until someone saves a set for that page in /admin/seo.
 *
 * Keyed by the same page paths the SEO dashboard uses. Supplier pages are the
 * exception: there are dozens of them and each needs its own vendor's details,
 * so they're generated per vendor by `defaultSupplierFaqs()` instead.
 *
 * Research-use-only content: nothing here describes a protocol, a dose, or an
 * outcome in a person or animal.
 */
export const DEFAULT_PAGE_FAQS: Readonly<Record<string, readonly FaqItem[]>> = {
  '/': [
    {
      question: `What is ${site.name}?`,
      answer: `${site.name} is an independent price-comparison tool for research compounds. We collect publicly listed prices, pack sizes and certificates of analysis from third-party suppliers and present them side by side, normalised to cost per milligram so listings of different sizes can be compared fairly.`,
    },
    {
      question: `Does ${site.name} sell anything?`,
      answer: `No. We do not manufacture, sell, store or ship any product. Every purchase happens directly between you and the supplier, on the supplier's own site, under their terms. Questions about an order, payment, delivery or product quality go to that supplier, not to us.`,
    },
    {
      question: 'How current are the prices shown?',
      answer: `Every price carries the time it was last observed, and that timestamp is the honest limit of what we can promise: the figure was correct when we recorded it, not necessarily at the moment you read it. Always confirm the current price and availability on the supplier's own page before buying.`,
    },
    {
      question: 'What does "lab verified" mean here?',
      answer: `It means the supplier publishes a certificate of analysis we can open and link to. We do not operate a laboratory and do not commission testing ourselves. A COA describes one batch at one point in time, so treat it as evidence to read critically rather than a guarantee.`,
    },
    {
      question: 'How does the site make money, and does that affect rankings?',
      answer: `Some outbound links are affiliate links, meaning we may earn a commission if you buy through them at no extra cost to you. Commission never changes the price you pay and never changes where a supplier appears: ordering follows the numbers and the filters you choose. There is no paid placement.`,
    },
  ],

  '/suppliers': [
    {
      question: 'How are suppliers chosen for this directory?',
      answer: `Most suppliers here have no relationship with us at all. We list them because they publish prices we can compare. A supplier does not have to pay, partner or ask to be included, and being listed is not an endorsement.`,
    },
    {
      question: 'What should I compare between suppliers?',
      answer: `Cost per milligram rather than headline price, since pack sizes differ; whether a certificate of analysis is published for the exact product and batch; shipping origin and speed; accepted payment methods; and whether any discount code applies. Each supplier card surfaces these so they can be scanned side by side.`,
    },
    {
      question: 'What do the star ratings represent?',
      answer: `A rating is the vendor's aggregate score from public review sources, shown only where we hold one. Vendors without a score simply do not display one rather than defaulting to zero, so an absent rating means "not yet recorded", not "rated poorly".`,
    },
    {
      question: 'How often is supplier information updated?',
      answer: `Listings are refreshed as vendor catalogues change, and every price carries its own "seen" timestamp. If you spot something out of date or wrong, tell us through the contact page and we will recheck it.`,
    },
    {
      question: 'Can I filter suppliers by what matters to me?',
      answer: `Yes. Use the search field to find a vendor by name, and the directory cards to compare product counts, shipping terms, payment options and active discount codes. Opening a supplier's page shows their full catalogue with per-listing pricing.`,
    },
  ],

  '/coupons': [
    {
      question: 'How do I use a coupon code from this page?',
      answer: `Tap the code to copy it, then paste it into the discount or promo field at checkout on the supplier's own site. Codes are applied by the vendor, not by ${site.name}, so the discount appears in their checkout rather than here.`,
    },
    {
      question: 'Are the prices on the site already discounted?',
      answer: `Where a vendor runs a sitewide code, product prices across the site are shown with that discount applied, and the code is displayed alongside so you know which one earns that price. You still have to enter the code at checkout for it to take effect.`,
    },
    {
      question: 'Why is a code not working?',
      answer: `Codes expire, get withdrawn, or carry conditions the vendor sets, such as first-time customers only, minimum order values or exclusions on certain products. We track codes as vendors publish them, but the vendor controls whether a code is live. Let us know and we will recheck it.`,
    },
    {
      question: 'Do you get paid when I use a code?',
      answer: `Sometimes. Some codes are tied to affiliate links, meaning we may earn a commission if you buy through them, at no extra cost to you. It does not change the price you pay or which codes we list.`,
    },
    {
      question: 'How are the coupons ordered?',
      answer: `By default the largest discount leads. Because many vendors run the same headline percentage, you can also sort by catalogue size or alphabetically to find a code from a vendor that actually stocks what you are comparing.`,
    },
  ],

  '/lab-reports': [
    {
      question: 'What is a certificate of analysis?',
      answer: `A COA is a laboratory document describing what a specific batch of material was found to contain, typically covering identity and purity, and sometimes heavy metals, endotoxins or sterility. It should name the product, the batch or lot, the analytical method used and the laboratory that ran it.`,
    },
    {
      question: `Does ${site.name} run these tests?`,
      answer: `No. Every certificate listed here was produced by or for the supplier. We link to the supplier's own document rather than rehosting it, so you always read the original. We do not operate a laboratory and do not commission testing.`,
    },
    {
      question: 'What makes a COA trustworthy?',
      answer: `Independent third-party testing rather than in-house QA; a lot number matching the vial; a named method such as HPLC-UV or LC-MS with real parameters; an actual chromatogram or spectrum rather than only a summary figure; and a recent date with an identifiable analyst or lab.`,
    },
    {
      question: 'Why do some listings have no report?',
      answer: `Because the vendor has not published one we can open, or the link they published does not resolve to a certificate. We show "Report Pending" rather than implying a document exists. An absent COA is information worth weighing.`,
    },
    {
      question: 'Does a COA guarantee what is in the vial I receive?',
      answer: `No. A certificate describes one batch at one point in time and cannot speak for a vial from a later production run. Documents can also be reused across batches or edited. Treat a COA as one input among several rather than proof.`,
    },
  ],

  '/tools': [
    {
      question: 'What are these tools for?',
      answer: `They handle the arithmetic that makes listings comparable: converting a vial price into cost per milligram, working out reconstitution volumes and syringe units, calculating intranasal spray quantities, and walking through what a certificate of analysis should contain.`,
    },
    {
      question: 'Do the calculators send my inputs anywhere?',
      answer: `No. Every calculator runs entirely in your browser. Nothing you type is transmitted to us or stored, and no account is needed to use any of them.`,
    },
    {
      question: 'Are these tools medical or dosing advice?',
      answer: `No. They are arithmetic utilities for laboratory and research contexts only. Nothing here is medical advice, a dosing recommendation, or an endorsement of any compound, and nothing listed on this site is intended for human or animal consumption.`,
    },
    {
      question: 'Which tool should I use to compare two listings?',
      answer: `The price per mg calculator. Two vials at different sizes and prices cannot be compared on headline price alone; converting both to cost per milligram puts them on one scale, which is the same normalisation the comparison tables use.`,
    },
    {
      question: 'Can I check results against real listings?',
      answer: `Yes. The price per mg tool lets you check a figure you have calculated against live supplier listings tracked on the site, so you can see where a price sits relative to the rest of the market.`,
    },
  ],

  '/price-checker': [
    {
      question: 'How is the price checker different from the supplier directory?',
      answer: `The supplier directory shows each vendor's full profile, including shipping terms, payment methods, review ratings and coupon codes. The price checker focuses on per-compound pricing: it groups every listing for a single compound across all tracked suppliers so you can compare cost per milligram in one view.`,
    },
    {
      question: 'How often are prices updated?',
      answer: `Every listing carries the time its price was last observed. Prices are refreshed as vendor catalogues change, and the timestamp is the honest limit of what we can promise: the figure was correct when we recorded it, not necessarily at the moment you read it. Confirm the current price on the vendor's own page before ordering.`,
    },
    {
      question: 'What does the strikethrough price mean?',
      answer: `A strikethrough price is the vendor's original list price before a sitewide coupon code is applied. The lower figure next to it is the price after the discount. Both are shown so you can see exactly how much the code saves. You still need to enter the code at the vendor's checkout for the discount to take effect.`,
    },
  ],

  '/tools/price-per-mg': [
    {
      question: 'How is cost per milligram calculated?',
      answer: `The total price is divided by the total milligrams in the pack. For a multi-vial kit that means vial size multiplied by the number of vials, so a 10-vial kit is not mistaken for a single vial. The result is the figure that lets differently-sized listings be compared on one scale.`,
    },
    {
      question: 'Why compare on price per mg rather than price?',
      answer: `Because headline price says nothing about quantity. A cheaper vial can easily cost more per milligram than a larger one. Normalising to cost per milligram is the only way to tell which listing actually offers more material for the money.`,
    },
    {
      question: 'Does the calculation include shipping or discounts?',
      answer: `The calculator works from the price you enter, so it includes whatever you type. Listings on the site show cost per milligram based on the observed price, with a vendor's sitewide coupon applied where one exists. Shipping is shown separately on supplier cards because it varies by destination and order value.`,
    },
    {
      question: 'How do I handle blends and multi-compound listings?',
      answer: `A blend's size is the combined total of its components, so a 5mg + 5mg blend is treated as 10mg. That keeps blends comparable with each other, though comparing a blend against a single compound on price per mg alone is rarely meaningful.`,
    },
    {
      question: 'Is a lower price per mg always the better buy?',
      answer: `No. It is one input. Verification, whether a certificate of analysis exists for that batch, stock status, shipping terms and vendor track record all matter alongside price. The cheapest figure on a page is not automatically the right choice.`,
    },
  ],

  '/tools/calculator': [
    {
      question: 'What does the reconstitution calculator do?',
      answer: `It converts between vial strength, the volume of diluent added, and the resulting concentration, so you can work out syringe units for a target quantity, or solve in the other direction for the volume needed to reach a given concentration.`,
    },
    {
      question: 'What are "units" in the result?',
      answer: `Units refer to the graduations on an insulin-style syringe, where 100 units correspond to 1mL. The calculator converts a volume into those graduations so the figure can be read directly off the barrel.`,
    },
    {
      question: 'Does the diluent volume change the total amount in the vial?',
      answer: `No. Adding more diluent does not change how much material the vial contains; it only changes the concentration, and therefore the volume that corresponds to a given quantity. The total in the vial is fixed by its labelled strength.`,
    },
    {
      question: 'Is this calculator giving me a dose?',
      answer: `No. It performs unit arithmetic only, for laboratory and research contexts. It does not recommend quantities, protocols or frequencies, and nothing listed on this site is intended for human or animal consumption.`,
    },
    {
      question: 'Are my inputs saved?',
      answer: `No. The calculator runs entirely in your browser. Nothing you enter is sent to us or stored anywhere, and no account is required.`,
    },
  ],

  '/tools/intranasal': [
    {
      question: 'What does the intranasal calculator work out?',
      answer: `It relates vial strength, diluent volume and spray-pump volume to give the quantity delivered per spray and the number of sprays a bottle yields, so a spray formulation can be described in the same quantitative terms as a vial.`,
    },
    {
      question: 'What spray volume should I enter?',
      answer: `Use the figure quoted by the pump's manufacturer. Metered nasal pumps commonly deliver around 0.1mL per actuation, but this varies by device, so the value printed for your specific pump is the one that makes the result meaningful.`,
    },
    {
      question: 'Why does the sprays-per-bottle figure come out lower than expected?',
      answer: `Pumps need priming, and a residual volume always remains below the dip tube that cannot be drawn up. The arithmetic here describes total volume divided by per-spray volume; real-world yield is lower.`,
    },
    {
      question: 'Is this a dosing recommendation?',
      answer: `No. It is a unit-conversion tool for laboratory and research contexts only. It does not recommend quantities, schedules or routes, and nothing listed on this site is intended for human or animal consumption.`,
    },
    {
      question: 'Does anything I enter leave my browser?',
      answer: `No. The calculation runs locally in your browser. Nothing is transmitted to us or stored, and no account is needed.`,
    },
  ],

  '/tools/coa-reader': [
    {
      question: 'What should a complete COA contain?',
      answer: `The product and its batch or lot number, a named analytical method with real parameters, the actual result rather than only a summary figure, the testing laboratory's identity, an analyst or QA sign-off, and a date. Missing any of these weakens what the document can tell you.`,
    },
    {
      question: 'What is the difference between third-party and in-house testing?',
      answer: `Third-party testing is performed by a laboratory independent of the seller; in-house QA is the seller testing their own product. Both can be legitimate, but independent testing carries more weight, and a document does not always make the distinction obvious.`,
    },
    {
      question: 'Why does a chromatogram matter?',
      answer: `A chromatogram or mass spectrum lets a reader check the stated purity against the underlying trace. A typed percentage with nothing behind it is the weakest form of evidence a certificate can offer, because there is no way to verify where the number came from.`,
    },
    {
      question: 'What are the clearest warning signs?',
      answer: `No lot number anywhere; no analytical method named; no chromatogram or spectrum; the same certificate reused across different products or batches; dates that do not line up with when the product was listed; stripped PDF metadata; and no laboratory or analyst identified.`,
    },
    {
      question: 'Does this tool store the COA I am checking?',
      answer: `No. The checklist runs entirely in your browser and nothing you tick is sent anywhere. It is a reading aid, not an upload or verification service.`,
    },
  ],
};

/**
 * FAQs for one guide's page. Generated rather than stored per guide, same as
 * suppliers below, so a newly added guide has sensible questions immediately;
 * saving a set in /admin/seo replaces these for that guide.
 */
export function defaultGuideFaqs(guide: {
  title: string;
  category: string;
  relatedTool?: { label: string; href: string };
}): FaqItem[] {
  const { title, category, relatedTool } = guide;

  return [
    {
      question: `Is "${title}" medical, legal or dosing advice?`,
      answer: `No. This guide is general research information only, not medical, legal or laboratory-protocol advice, and nothing listed on this site is intended for human or animal consumption. See the full disclaimer for the terms this site operates under.`,
    },
    {
      question: 'Who is this guide written for?',
      answer: `Anyone comparing research-compound listings who wants the background on a ${category.toLowerCase()} topic before acting on it. It explains the concept in general terms rather than recommending a specific product, protocol or supplier.`,
    },
    {
      question: 'How current is the information in this guide?',
      answer: `Guides are reviewed periodically, but supplier practices, pricing and lab-reporting norms change faster than any article can track in real time. Treat this as background context and confirm specifics, such as a current price or a published certificate of analysis, directly against the live listing.`,
    },
    relatedTool
      ? {
          question: 'Is there a calculator that goes with this guide?',
          answer: `Yes. The ${relatedTool.label} tool linked above applies the arithmetic or checklist this guide describes, so you can work through your own numbers rather than only reading about the concept.`,
        }
      : {
          question: 'Where can I see this applied to real listings?',
          answer: `The suppliers directory and lab reports page show these concepts applied to actual vendor listings and certificates, rather than in the abstract.`,
        },
    {
      question: "I have a question this guide doesn't answer. What now?",
      answer: 'Reach out through the contact page. Guides get expanded and corrected based on exactly that kind of feedback.',
    },
  ];
}

/**
 * FAQs for one supplier's page. Generated rather than stored per vendor, so a
 * newly added supplier has sensible questions immediately; saving a set in
 * /admin/seo replaces these for that vendor.
 */
export function defaultSupplierFaqs(supplier: {
  name: string;
  country: string | null;
  shippingSpeed: string | null;
  paymentMethods: readonly string[];
  coupon: { code: string; percentOff: number } | null;
}): FaqItem[] {
  const { name } = supplier;

  return [
    {
      question: `Does ${site.name} sell ${name}'s products?`,
      answer: `No. ${site.name} is a comparison tool. We list ${name}'s publicly published prices so they can be compared with other suppliers, but every order is placed on ${name}'s own site, under their terms. Questions about orders, payment, shipping or product quality go to ${name} directly.`,
    },
    {
      question: `Does ${name} publish certificates of analysis?`,
      answer: `Where ${name} publishes a COA we can open, it is linked from the relevant listing and included in our lab reports directory. Listings without a linked document show no COA rather than implying one exists. A certificate describes a single batch, so check that the lot matches what you receive.`,
    },
    {
      question: supplier.shippingSpeed
        ? `How long does ${name} take to ship?`
        : `What are ${name}'s shipping terms?`,
      answer: supplier.shippingSpeed
        ? `${name} states: ${supplier.shippingSpeed}. Shipping terms are set and fulfilled by the vendor, not by ${site.name}, and can change without notice, so confirm current terms at their checkout${supplier.country ? `. Orders ship from ${supplier.country}` : ''}.`
        : `${name} has not published shipping terms we can quote here. Shipping is arranged entirely by the vendor, so check their own shipping page or checkout for current costs and delivery times${supplier.country ? `. The vendor operates from ${supplier.country}` : ''}.`,
    },
    {
      question: `What payment methods does ${name} accept?`,
      answer:
        supplier.paymentMethods.length > 0
          ? `${name} lists: ${supplier.paymentMethods.join(', ')}. Payment is handled entirely on the vendor's own site; ${site.name} never processes payments or handles payment details.`
          : `${name} has not published a payment-method list we can quote here. Payment options appear at their checkout and are handled entirely by the vendor; ${site.name} never processes payments or handles payment details.`,
    },
    {
      question: supplier.coupon
        ? `Is there a discount code for ${name}?`
        : `How current are the ${name} prices shown here?`,
      answer: supplier.coupon
        ? `Yes. The code ${supplier.coupon.code} is listed for ${supplier.coupon.percentOff}% off, and prices shown on this site already reflect it. You still need to enter the code at ${name}'s checkout for the discount to apply. Codes are set by the vendor and can expire or carry conditions.`
        : `Each listing carries the time its price was last observed. That is the honest limit of what we can promise: the figure was correct when recorded, not necessarily right now. Confirm the current price on ${name}'s own product page before buying.`,
    },
  ];
}
