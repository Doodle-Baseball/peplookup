import type { SupplierReview } from '@/lib/schema';

/**
 * Real Trustpilot reviews supplied by the site owner, transcribed from
 * `src/Final_vendor_reviews - peplookup_vendor_reviews.csv`. Regenerate from
 * that sheet rather than hand-editing entries here.
 *
 * These are actual published reviews, not placeholders, the fabricated sample
 * set this replaced is gone. They act as the seed for a vendor that has no rows
 * in the `supplier_reviews` table yet; anything entered through
 * /admin/vendors is stored in the database and always takes precedence.
 *
 * Profiles for vendors that are not in the catalogue yet are kept deliberately:
 * add the vendor later under the same name (or the same website domain) and its
 * reviews attach automatically.
 *
 * 38 vendors, 164 reviews.
 */
export interface VendorReviewProfile {
  /** Vendor name exactly as it appears in the source sheet. */
  vendorName: string;
  /** Domain of the vendor's Trustpilot profile, matches vendors whose display name differs. */
  domain: string | null;
  /** Headline Trustpilot score out of 5. */
  rating: number | null;
  trustpilotUrl: string | null;
  reviews: readonly SupplierReview[];
}

export const VENDOR_REVIEW_PROFILES: readonly VendorReviewProfile[] = [
  {
    vendorName: "Americanpeptides",
    domain: "americanpeptides.us",
    rating: 3.4,
    trustpilotUrl: "https://www.trustpilot.com/review/americanpeptides.us",
    reviews: [
      {
        author: "Thomas",
        rating: 5,
        reviewedAt: "2026-09-01",
        body: "Shipping was fast and the order arrived without any issues. Overall a positive experience with Americanpeptides and no complaints about the service.",
      },
      {
        author: "Christopher Lakian",
        rating: 2,
        reviewedAt: "2026-09-07",
        body: "Delivery took around five days despite paying for two-day overnight shipping. The slow fulfillment was the main disappointment with this order.",
      },
      {
        author: "Kenneth Whitt",
        rating: 5,
        reviewedAt: "2026-09-06",
        body: "Product quality has been consistently very good across orders, and the overall service experience with Americanpeptides has met expectations.",
      },
      {
        author: "Carmen Hernandez",
        rating: 3,
        reviewedAt: "2026-09-04",
        body: "A mixed experience overall. The reviewer plans to follow up with a fuller account of their order once they have tested the products further.",
      },
      {
        author: "Robert Boyd",
        rating: 1,
        reviewedAt: "2026-08-22",
        body: "The reviewer arrived through a TikTok link and reported an unsatisfactory experience with the order, warning others to research the vendor first.",
      },
    ],
  },
  {
    vendorName: "Ameanopeptides",
    domain: "ameanopeptides.com",
    rating: 4.7,
    trustpilotUrl: "https://www.trustpilot.com/review/ameanopeptides.com",
    reviews: [
      {
        author: "Neena",
        rating: 1,
        reviewedAt: "2026-09-08",
        body: "The reviewer noted a separate Canadian version of the company and rated the experience poorly, citing confusion over which site to trust.",
      },
      {
        author: "Anton Hofmann",
        rating: 5,
        reviewedAt: "2026-09-04",
        body: "A repeat customer who has ordered multiple times and consistently received good products and reliable service from Ameanopeptides.",
      },
      {
        author: "IGOR W",
        rating: 1,
        reviewedAt: "2026-08-14",
        body: "The reviewer felt the company prioritizes profit over customer care and came away dissatisfied with how their order and questions were handled.",
      },
      {
        author: "Larry LZ",
        rating: 5,
        reviewedAt: "2026-08-11",
        body: "A 10/10 experience from start to finish, with the reviewer praising both the products received and the standard of service throughout the order.",
      },
      {
        author: "Mike",
        rating: 5,
        reviewedAt: "2026-08-04",
        body: "A five-star rating was left on Trustpilot without written detail, indicating a positive overall experience with the order and the service.",
      },
    ],
  },
  {
    vendorName: "IDUN Peptides",
    domain: "idunpeptides.com",
    rating: 4.9,
    trustpilotUrl: "https://www.trustpilot.com/review/idunpeptides.com",
    reviews: [
      {
        author: "Daniel Stapleton",
        rating: 5,
        reviewedAt: "2026-09-03",
        body: "Customer service has been outstanding throughout, with the team responsive and helpful at every stage of the order process.",
      },
      {
        author: "David Castaldo",
        rating: 5,
        reviewedAt: "2026-09-04",
        body: "Email questions were answered quickly and thoroughly, which made for a smooth and reassuring ordering experience with IDUN Peptides.",
      },
      {
        author: "Karyn Allison McPherson",
        rating: 5,
        reviewedAt: "2026-07-20",
        body: "A five-star rating was submitted on Trustpilot without accompanying written comments, reflecting a positive overall experience with the vendor.",
      },
      {
        author: "Cheryl Mahady",
        rating: 5,
        reviewedAt: "2026-08-19",
        body: "The reviewer left a five-star rating with no written feedback, indicating satisfaction with the products and service received from IDUN Peptides.",
      },
    ],
  },
  {
    vendorName: "Blue Ridge Peptides",
    domain: "blueridgepeptides.com",
    rating: 4.8,
    trustpilotUrl: "https://www.trustpilot.com/review/blueridgepeptides.com",
    reviews: [
      {
        author: "Mari Miller",
        rating: 5,
        reviewedAt: "2026-08-27",
        body: "The team is a pleasure to work with, and the reviewer highlighted friendly, straightforward communication throughout the ordering process.",
      },
      {
        author: "Linda",
        rating: 5,
        reviewedAt: "2026-07-28",
        body: "Shipping was extremely fast and the overall experience was described as amazing, with the order arriving sooner than the reviewer expected.",
      },
      {
        author: "Dawn Barnard",
        rating: 5,
        reviewedAt: "2026-07-25",
        body: "Five-star service from Blue Ridge Peptides, with the reviewer pointing to a smooth order process and reliable, on-time delivery.",
      },
      {
        author: "Dewayne Caldwell",
        rating: 5,
        reviewedAt: "2026-03-21",
        body: "The reviewer described the staff as wonderful folks and reported a positive experience around both the service and the ordering process.",
      },
    ],
  },
  {
    vendorName: "Peakforce Labs",
    domain: "peakforcelabs.com",
    rating: 4.7,
    trustpilotUrl: "https://www.trustpilot.com/review/peakforcelabs.com",
    reviews: [
      {
        author: "Consumer",
        rating: 5,
        reviewedAt: "2026-08-12",
        body: "The reviewer recommends starting any research with PFL, citing a positive overall experience with the company's products and service.",
      },
      {
        author: "Hunter King",
        rating: 3,
        reviewedAt: "2026-08-26",
        body: "A mixed review centered on the shipping and packaging of the order, which fell short of expectations even though other aspects were acceptable.",
      },
      {
        author: "Allyson Watkins",
        rating: 5,
        reviewedAt: "2026-08-22",
        body: "A first-time order with Peakforce Labs went well, and the reviewer reported a positive experience with both delivery and the products received.",
      },
    ],
  },
  {
    vendorName: "Eliteedgebiotech",
    domain: "eliteedgebiotech.com",
    rating: 4.8,
    trustpilotUrl: "https://www.trustpilot.com/review/eliteedgebiotech.com",
    reviews: [
      {
        author: "Mitchell",
        rating: 5,
        reviewedAt: "2026-08-29",
        body: "Customer service is very responsive, and the reviewer reported a smooth ordering experience with prompt replies to all of their questions.",
      },
      {
        author: "Todd Gaster",
        rating: 5,
        reviewedAt: "2026-08-26",
        body: "The reviewer praised incredible product quality alongside phenomenal customer service, describing a thoroughly positive experience overall.",
      },
      {
        author: "Muhammad Rehan",
        rating: 5,
        reviewedAt: "2026-08-01",
        body: "Best customer service and an awesome experience overall, with the reviewer highlighting helpful support and a completely trouble-free order.",
      },
      {
        author: "Tarah Anderson",
        rating: 5,
        reviewedAt: "2026-07-01",
        body: "An order of seven bottles of Tesamorelin plus additional items arrived as expected, and the reviewer was satisfied with the service provided.",
      },
    ],
  },
  {
    vendorName: "Empower Peptides",
    domain: "empower-peptides.com",
    rating: 4.6,
    trustpilotUrl: "https://www.trustpilot.com/review/empower-peptides.com",
    reviews: [
      {
        author: "James Van Kirk",
        rating: 5,
        reviewedAt: "2026-08-27",
        body: "The reviewer switched to Empower from another supplier and has been pleased with the products and level of service since making the change.",
      },
      {
        author: "Luis Bauza",
        rating: 5,
        reviewedAt: "2026-08-26",
        body: "Excellent service and products, with the reviewer reporting a straightforward order and no issues with delivery or communication.",
      },
      {
        author: "Melissa Rosado",
        rating: 5,
        reviewedAt: "2026-06-29",
        body: "A five-star rating was left on Trustpilot with no written comments, reflecting a positive overall experience with Empower Peptides.",
      },
      {
        author: "Alexander Morales",
        rating: 5,
        reviewedAt: "2026-06-25",
        body: "The reviewer described a really great experience with the company, from placing the order through to receiving the products.",
      },
      {
        author: "Patrick Rougeau",
        rating: 5,
        reviewedAt: "2026-06-24",
        body: "Great service noted by the reviewer, who reported a smooth ordering process and a positive overall experience with the vendor.",
      },
    ],
  },
  {
    vendorName: "Global Aminos",
    domain: "globalaminos.com",
    rating: 4.7,
    trustpilotUrl: "https://www.trustpilot.com/review/globalaminos.com",
    reviews: [
      {
        author: "Elke",
        rating: 5,
        reviewedAt: "2026-07-20",
        body: "The reviewer praised both the customer service and the product itself, describing a positive overall experience with Global Aminos.",
      },
      {
        author: "Rob Lopez",
        rating: 5,
        reviewedAt: "2026-08-14",
        body: "A five-star rating was submitted without written detail, indicating a positive overall experience with the order and the service.",
      },
      {
        author: "Anna Gee",
        rating: 5,
        reviewedAt: "2026-07-26",
        body: "The reviewer left a five-star rating on Trustpilot without additional comments, reflecting clear satisfaction with the vendor.",
      },
      {
        author: "Cheryl Mahady",
        rating: 5,
        reviewedAt: "2026-07-11",
        body: "A five-star rating was given with no written feedback attached, pointing to a positive experience with Global Aminos.",
      },
      {
        author: "Dinopep",
        rating: 4,
        reviewedAt: "2025-11-05",
        body: "A four-star rating was left without written comments, suggesting a largely positive experience with minor room for improvement.",
      },
    ],
  },
  {
    vendorName: "Amino Club",
    domain: "aminoclub.com",
    rating: 4.6,
    trustpilotUrl: "https://www.trustpilot.com/review/aminoclub.com",
    reviews: [
      {
        author: "Christopher Jernigan",
        rating: 5,
        reviewedAt: "2026-09-08",
        body: "Great products backed by incredible customer service, with the reviewer highlighting helpful support throughout the order.",
      },
      {
        author: "Leo",
        rating: 5,
        reviewedAt: "2026-09-10",
        body: "A consistently good company to deal with, according to the reviewer, who has had reliable service across repeat orders.",
      },
      {
        author: "Miguel Miranda",
        rating: 5,
        reviewedAt: "2026-09-09",
        body: "Amino Club has been great to order from, with the reviewer reporting a smooth process and a positive overall experience.",
      },
      {
        author: "Brian",
        rating: 5,
        reviewedAt: "2026-09-09",
        body: "The reviewer now uses Amino Club for all of their research needs, citing dependable products and consistent service.",
      },
      {
        author: "Jimmy O.",
        rating: 5,
        reviewedAt: "2026-09-08",
        body: "Described as the best in the space by this repeat customer, who has ordered several times and been satisfied each time.",
      },
    ],
  },
  {
    vendorName: "Pepvida Labs",
    domain: "pepvidalabs.com",
    rating: 4.7,
    trustpilotUrl: "https://www.trustpilot.com/review/pepvidalabs.com",
    reviews: [
      {
        author: "Anthony Pagnotta",
        rating: 5,
        reviewedAt: "2026-06-10",
        body: "The website is neat and functional, which made ordering straightforward, and the reviewer reported a favorable overall experience.",
      },
      {
        author: "Marine",
        rating: 5,
        reviewedAt: "2026-01-27",
        body: "The reviewer is very satisfied with their peptide purchase and reported a positive experience with both the product and the service.",
      },
      {
        author: "Martha Fuentes",
        rating: 4,
        reviewedAt: "2026-05-13",
        body: "A four-star rating was left on Trustpilot without written comments, indicating a broadly positive experience with the order.",
      },
    ],
  },
  {
    vendorName: "CertaPeptides",
    domain: "certapeptides.com",
    rating: 4.5,
    trustpilotUrl: "https://www.trustpilot.com/review/certapeptides.com",
    reviews: [
      {
        author: "Chris Delahaye",
        rating: 5,
        reviewedAt: "2026-09-06",
        body: "A short but clearly positive review, with the customer describing a great experience covering service, delivery and the order itself.",
      },
      {
        author: "Majken",
        rating: 5,
        reviewedAt: "2026-08-14",
        body: "The reviewer considers CertaPeptides the real deal and reported a favorable experience with the products and the ordering process.",
      },
      {
        author: "Abdulrahman Alkubaisi Avery",
        rating: 5,
        reviewedAt: "2026-08-22",
        body: "Initially skeptical, the reviewer was pleasantly surprised by the quality of the products and the standard of service received.",
      },
      {
        author: "Frederick Fazbearington III",
        rating: 5,
        reviewedAt: "2026-07-22",
        body: "Described as a perfect supplier by the reviewer, who reported no issues with the order, the delivery or the communication.",
      },
      {
        author: "Soulaimaan",
        rating: 5,
        reviewedAt: "2026-09-04",
        body: "A great company with very good service, according to the reviewer, who had a positive experience from order through to delivery.",
      },
    ],
  },
  {
    vendorName: "Gmrpeptides",
    domain: "gmrpeptides.com",
    rating: 4.3,
    trustpilotUrl: "https://www.trustpilot.com/review/gmrpeptides.com",
    reviews: [
      {
        author: "John",
        rating: 5,
        reviewedAt: "2026-08-10",
        body: "A five-star rating was left on Trustpilot without written comments, reflecting a positive overall experience with Gmrpeptides.",
      },
    ],
  },
  {
    vendorName: "Genpeptide",
    domain: "genpeptide.com",
    rating: 4.4,
    trustpilotUrl: "https://www.trustpilot.com/review/genpeptide.com",
    reviews: [
      {
        author: "Barbara Ferber",
        rating: 5,
        reviewedAt: "2026-07-04",
        body: "In the reviewer's experience the company delivers consistently, and they reported a positive outcome with their order and the service.",
      },
      {
        author: "Vic Toria",
        rating: 5,
        reviewedAt: "2026-07-30",
        body: "The reviewer now buys exclusively from this company, citing reliable products and a consistently good ordering experience.",
      },
      {
        author: "Nyasha Mapenz",
        rating: 5,
        reviewedAt: "2026-06-07",
        body: "The reviewer is glad they ordered from Genpeptide and reported clear satisfaction with the products and the service received.",
      },
      {
        author: "Mike",
        rating: 5,
        reviewedAt: "2026-05-20",
        body: "Following up on an earlier review, the reviewer reported an improved outcome and a positive experience with the company.",
      },
      {
        author: "Jason",
        rating: 5,
        reviewedAt: "2026-04-27",
        body: "After numerous orders with Genpeptide, the reviewer reports consistent product quality and dependable service each time.",
      },
    ],
  },
  {
    vendorName: "Vertex Labs",
    domain: "vertexpeptideslab.org",
    rating: 4.3,
    trustpilotUrl: "https://www.trustpilot.com/review/vertexpeptideslab.org",
    reviews: [
      {
        author: "Amanda",
        rating: 5,
        reviewedAt: "2026-08-12",
        body: "Shipping was fast and the products arrived exactly as described, making for a positive overall experience with Vertex Labs.",
      },
      {
        author: "Javier Rodriguez Diaz",
        rating: 5,
        reviewedAt: "2026-08-03",
        body: "Great customer service, with the reviewer noting helpful and prompt communication throughout the ordering process.",
      },
      {
        author: "DK",
        rating: 1,
        reviewedAt: "2026-08-11",
        body: "The reviewer reported poor responsiveness from customer service and was unable to get their questions resolved satisfactorily.",
      },
      {
        author: "Javier Ortiz",
        rating: 5,
        reviewedAt: "2026-08-03",
        body: "Fast delivery noted by the reviewer, who received their order promptly and had no issues with the overall process.",
      },
      {
        author: "Thomas",
        rating: 5,
        reviewedAt: "2026-08-12",
        body: "Delivery times were excellent, and the reviewer reported a positive experience with the order from checkout to arrival.",
      },
    ],
  },
  {
    vendorName: "Lostcoastaminos",
    domain: "lostcoastaminos.com",
    rating: 4.7,
    trustpilotUrl: "https://www.trustpilot.com/review/lostcoastaminos.com",
    reviews: [
      {
        author: "Choose To Be Happy!",
        rating: 5,
        reviewedAt: "2026-08-15",
        body: "Described as a trusted source with strong service, with the reviewer reporting a reliable order and consistent product quality.",
      },
      {
        author: "Jaime Flores",
        rating: 5,
        reviewedAt: "2026-07-01",
        body: "The reviewer credits Bill with making LCA stand out, praising both the level of service and the quality of the products.",
      },
      {
        author: "customer",
        rating: 5,
        reviewedAt: "2026-03-02",
        body: "So far so good, according to the reviewer, who reported a favorable early experience with the service and the delivery.",
      },
      {
        author: "Daniel E.",
        rating: 5,
        reviewedAt: "2026-02-16",
        body: "A five-star rating was submitted without written comments, indicating a positive overall experience with Lostcoastaminos.",
      },
    ],
  },
  {
    vendorName: "Rivn Peptides",
    domain: "rivnresearch.com",
    rating: 4.9,
    trustpilotUrl: "https://www.trustpilot.com/review/rivnresearch.com",
    reviews: [
      {
        author: "JCruz Gonzalez",
        rating: 5,
        reviewedAt: "2026-09-10",
        body: "Great pricing combined with very fast shipping, and the reviewer reported a positive experience with the order overall.",
      },
      {
        author: "Scott Thomas",
        rating: 5,
        reviewedAt: "2026-09-08",
        body: "An exceptional experience every time, according to this repeat customer, who highlighted consistent service and quality.",
      },
      {
        author: "Elisa",
        rating: 5,
        reviewedAt: "2026-09-10",
        body: "Great products and an easy, fast ordering process, with the reviewer reporting no issues at any stage of the purchase.",
      },
      {
        author: "robbie phillips",
        rating: 5,
        reviewedAt: "2026-09-07",
        body: "Described simply as a great vendor, with the reviewer reporting a smooth order and a positive overall experience.",
      },
      {
        author: "Judy Gellis",
        rating: 5,
        reviewedAt: "2026-09-10",
        body: "A great company according to the reviewer, who was satisfied with the products received and the service provided.",
      },
    ],
  },
  {
    vendorName: "Ora Labs",
    domain: null,
    rating: 4.5,
    trustpilotUrl: null,
    reviews: [
      {
        author: "Adrian Aracena",
        rating: 5,
        reviewedAt: "2026-03-01",
        body: "The reviewer said the products changed their life and reported a strongly positive overall experience with Ora Labs.",
      },
      {
        author: "Michel",
        rating: 5,
        reviewedAt: "2026-04-02",
        body: "An incredible experience according to the reviewer, who was pleased with both the products and the service received.",
      },
      {
        author: "Consumer",
        rating: 5,
        reviewedAt: "2026-03-12",
        body: "The website was very easy to navigate, which made ordering simple, and the reviewer reported a positive experience.",
      },
      {
        author: "the lip",
        rating: 5,
        reviewedAt: "2026-03-03",
        body: "Very good service at Ora Labs, with the reviewer reporting a straightforward order and no issues with the delivery.",
      },
      {
        author: "J A Y 編集",
        rating: 5,
        reviewedAt: "2026-04-01",
        body: "Super fast shipping and great product quality, with the reviewer reporting a smooth and positive ordering experience.",
      },
    ],
  },
  {
    vendorName: "Arizenbiolabs",
    domain: "arizenbiolabs.com",
    rating: 4.8,
    trustpilotUrl: "https://www.trustpilot.com/review/arizenbiolabs.com",
    reviews: [
      {
        author: "Cyro Sarracino",
        rating: 5,
        reviewedAt: "2026-08-27",
        body: "Worth the price for the peace of mind, according to the reviewer, who was satisfied with both quality and service.",
      },
      {
        author: "garrigasf",
        rating: 5,
        reviewedAt: "2026-08-03",
        body: "Amazing customer service, with the reviewer highlighting prompt, helpful responses throughout the ordering process.",
      },
      {
        author: "Jessica Garcia",
        rating: 5,
        reviewedAt: "2026-08-14",
        body: "Delivery was very fast, and the reviewer reported a positive experience with the order and the products received.",
      },
      {
        author: "Bre Foley",
        rating: 5,
        reviewedAt: "2026-08-18",
        body: "Speedy delivery and products well suited to research purposes, with the reviewer reporting no issues with the order.",
      },
      {
        author: "Brian sobel",
        rating: 5,
        reviewedAt: "2026-08-18",
        body: "An honest and positive account of the service, with the reviewer satisfied with delivery and the overall experience.",
      },
    ],
  },
  {
    vendorName: "PeptideGiants",
    domain: "peptidegiants.com",
    rating: 4.6,
    trustpilotUrl: "https://www.trustpilot.com/review/peptidegiants.com",
    reviews: [
      {
        author: "Jim Heaton",
        rating: 5,
        reviewedAt: "2026-08-20",
        body: "Very fast service, with the reviewer reporting quick dispatch and a smooth experience from order through to delivery.",
      },
      {
        author: "John Tuder",
        rating: 5,
        reviewedAt: "2026-07-22",
        body: "Payment was easy and the checkout process was straightforward, contributing to a positive overall ordering experience.",
      },
      {
        author: "Angie Krieger Bergen",
        rating: 5,
        reviewedAt: "2026-07-22",
        body: "Three orders placed so far, with the reviewer reporting consistent product quality and dependable service each time.",
      },
      {
        author: "Julia Domac",
        rating: 5,
        reviewedAt: "2026-07-22",
        body: "Great products at the lowest prices, according to the reviewer, who was satisfied with the value and the service.",
      },
      {
        author: "C hyneman",
        rating: 5,
        reviewedAt: "2026-06-11",
        body: "A complaint was raised with the company and handled well, leaving the reviewer satisfied with how it was resolved.",
      },
    ],
  },
  {
    vendorName: "Purgo Labs",
    domain: "purgolabs.com",
    rating: 4.7,
    trustpilotUrl: "https://www.trustpilot.com/review/purgolabs.com",
    reviews: [
      {
        author: "Marcos Garcia, PMP",
        rating: 5,
        reviewedAt: "2026-09-09",
        body: "After fifteen orders with Purgo Labs, the reviewer reports consistent product quality and reliable service throughout.",
      },
      {
        author: "D adams",
        rating: 4,
        reviewedAt: "2026-09-01",
        body: "An early review after a first order, with the reviewer reporting a positive initial experience with service and delivery.",
      },
      {
        author: "Consumer",
        rating: 5,
        reviewedAt: "2026-09-07",
        body: "Great customer service, with the reviewer noting helpful and responsive communication during the ordering process.",
      },
      {
        author: "Angela Madsen",
        rating: 5,
        reviewedAt: "2026-09-01",
        body: "The reviewer secured a great price on their order and was satisfied with both the value and the service received.",
      },
      {
        author: "Marcus Zero",
        rating: 5,
        reviewedAt: "2026-08-30",
        body: "The reviewer found Purgo Labs early in their research and has since had a consistently positive ordering experience.",
      },
    ],
  },
  {
    vendorName: "True Research Labs",
    domain: "trueresearchlabs.com",
    rating: 4.1,
    trustpilotUrl: "https://www.trustpilot.com/review/trueresearchlabs.com",
    reviews: [
      {
        author: "John John",
        rating: 1,
        reviewedAt: "2026-07-24",
        body: "The reviewer warns that the negative reviews of this company are accurate and reported an unsatisfactory experience of their own.",
      },
      {
        author: "Jacob B",
        rating: 1,
        reviewedAt: "2026-08-12",
        body: "The reviewer accused a company representative of dishonest dealing and reported a negative experience they would not repeat.",
      },
      {
        author: "Mic M.",
        rating: 1,
        reviewedAt: "2026-08-09",
        body: "The reviewer raised serious concerns about product contamination and described an unsatisfactory experience with the order.",
      },
      {
        author: "Dang Tien Long",
        rating: 1,
        reviewedAt: "2026-08-27",
        body: "The reviewer alleged that affiliate partners were blocked and commissions withheld, describing the operation as a scam.",
      },
      {
        author: "Reese Price",
        rating: 5,
        reviewedAt: "2026-06-27",
        body: "The order arrived quickly and the products were as described, making for a positive experience in this reviewer's case.",
      },
    ],
  },
  {
    vendorName: "Heezresearch",
    domain: "heezresearch.com",
    rating: 3.6,
    trustpilotUrl: "https://www.trustpilot.com/review/heezresearch.com",
    reviews: [
      {
        author: "Rooni S.",
        rating: 5,
        reviewedAt: "2026-07-31",
        body: "Great product quality according to the reviewer, who reported a positive experience with the order and the service.",
      },
      {
        author: "Rosy Bloom",
        rating: 1,
        reviewedAt: "2026-08-05",
        body: "The reviewer was required to pay for two-day shipping and reported problems with the order afterwards, leaving them dissatisfied.",
      },
      {
        author: "Scott",
        rating: 1,
        reviewedAt: "2026-07-28",
        body: "The reviewer ordered the wrong item by accident and reported difficulty resolving the issue with the company afterwards.",
      },
      {
        author: "Jeff",
        rating: 5,
        reviewedAt: "2026-07-01",
        body: "Among the best and most affordable options available, according to the reviewer, who was pleased with quality and value.",
      },
      {
        author: "Amarah Hindi",
        rating: 5,
        reviewedAt: "2026-07-01",
        body: "The website is easy to navigate, which made ordering simple, and the reviewer reported a positive overall experience.",
      },
    ],
  },
  {
    vendorName: "Southernaminos",
    domain: "southernaminos.com",
    rating: 4.5,
    trustpilotUrl: "https://www.trustpilot.com/review/southernaminos.com",
    reviews: [
      {
        author: "Chris",
        rating: 5,
        reviewedAt: "2026-08-31",
        body: "Described as the best of the best by the reviewer, who was pleased with both the products and the level of service.",
      },
      {
        author: "customer",
        rating: 5,
        reviewedAt: "2026-08-31",
        body: "Great prices, with the reviewer highlighting good value alongside a smooth ordering and delivery experience overall.",
      },
      {
        author: "Luis Rivera",
        rating: 5,
        reviewedAt: "2026-08-30",
        body: "A great site to order from, according to the reviewer, who reported a straightforward process and no issues at all.",
      },
      {
        author: "Raul Martinez",
        rating: 5,
        reviewedAt: "2026-09-09",
        body: "Southernaminos offers the best products in the reviewer's view, and their order and service experience matched that.",
      },
      {
        author: "Yolanda Mckinney",
        rating: 5,
        reviewedAt: "2026-09-07",
        body: "An amazing company according to the reviewer, who highlighted dependable service and satisfaction with their order.",
      },
    ],
  },
  {
    vendorName: "The Peptide Labs CANADA",
    domain: "thepeptidelabs.ca",
    rating: 4.2,
    trustpilotUrl: "https://www.trustpilot.com/review/thepeptidelabs.ca",
    reviews: [
      {
        author: "Dee",
        rating: 5,
        reviewedAt: "2026-08-03",
        body: "Great customer service alongside solid products, with the reviewer reporting a smooth and trouble-free ordering experience.",
      },
      {
        author: "Temporary Peace",
        rating: 3,
        reviewedAt: "2026-08-30",
        body: "The reviewer questioned why the GHK-Cu appeared white rather than the expected color, leaving them uncertain about the product.",
      },
      {
        author: "Paul S",
        rating: 5,
        reviewedAt: "2026-08-06",
        body: "A happy customer overall, with the reviewer reporting a positive experience covering service, delivery and the order.",
      },
      {
        author: "Ty",
        rating: 5,
        reviewedAt: "2026-08-05",
        body: "Great service and good products, according to the reviewer, who had no issues with the order or with its delivery.",
      },
      {
        author: "HILL/TRAVIS RAIE",
        rating: 5,
        reviewedAt: "2026-08-15",
        body: "A five-star rating was left on Trustpilot without written comments, indicating a positive overall experience overall.",
      },
    ],
  },
  {
    vendorName: "Genx Peptides",
    domain: "genx.bio",
    rating: 4.3,
    trustpilotUrl: "https://www.trustpilot.com/review/genx.bio",
    reviews: [
      {
        author: "Rose",
        rating: 5,
        reviewedAt: "2025-01-20",
        body: "The order process was easy and straightforward, and the reviewer reported a positive overall experience with the vendor.",
      },
      {
        author: "Julia ELLIS",
        rating: 5,
        reviewedAt: "2025-01-20",
        body: "A returning customer who has bought peptides from this company repeatedly and continues to be satisfied with the service.",
      },
    ],
  },
  {
    vendorName: "Crystalpeptides",
    domain: "crystalpeptides.eu",
    rating: 4.5,
    trustpilotUrl: "https://www.trustpilot.com/review/crystalpeptides.eu",
    reviews: [
      {
        author: "schotel remy",
        rating: 5,
        reviewedAt: "2026-07-02",
        body: "Good products according to the reviewer, who reported a positive experience with the order and the delivery process.",
      },
      {
        author: "Valentin",
        rating: 5,
        reviewedAt: "2026-07-15",
        body: "Top-quality products, with the reviewer reporting a favorable experience covering both the order and the service.",
      },
    ],
  },
  {
    vendorName: "Peptidesupply.org",
    domain: "peptidesupply.org",
    rating: 3.3,
    trustpilotUrl: "https://www.trustpilot.com/review/peptidesupply.org",
    reviews: [
      {
        author: "Btwice B",
        rating: 1,
        reviewedAt: "2026-07-13",
        body: "The reviewer reported receiving glasses instead of the peptides ordered and was left dissatisfied with how it was handled.",
      },
      {
        author: "Roldan",
        rating: 5,
        reviewedAt: "2026-03-03",
        body: "Delivery was fast, and the reviewer reported a positive experience with the order arriving sooner than expected.",
      },
      {
        author: "Jamie",
        rating: 1,
        reviewedAt: "2026-05-28",
        body: "The reviewer placed an order that included bacteriostatic water and reported problems with fulfillment and support.",
      },
      {
        author: "Jolene Gimse",
        rating: 1,
        reviewedAt: "2026-05-28",
        body: "The reviewer tried to cancel their order without success and was left dissatisfied with the company's response.",
      },
      {
        author: "Jay Jacobs",
        rating: 5,
        reviewedAt: "2026-05-04",
        body: "The product arrived faster than expected, and the reviewer reported a positive experience with the order overall.",
      },
    ],
  },
  {
    vendorName: "Peptide Titans",
    domain: "peptidetitans.com",
    rating: 4.4,
    trustpilotUrl: "https://www.trustpilot.com/review/peptidetitans.com",
    reviews: [
      {
        author: "Sofia Gatti",
        rating: 5,
        reviewedAt: "2026-08-13",
        body: "An order of KLOW alongside BPC arrived as expected, and the reviewer was satisfied with the products and service.",
      },
      {
        author: "Sean Wade",
        rating: 5,
        reviewedAt: "2026-08-12",
        body: "The team at Peptide Titans was praised for being helpful and attentive throughout the entire ordering process.",
      },
      {
        author: "Paulina Deluca",
        rating: 5,
        reviewedAt: "2026-07-30",
        body: "The reviewer has been really impressed with Peptide Titans, citing product quality and a smooth order experience.",
      },
      {
        author: "Viviana Mantilla",
        rating: 5,
        reviewedAt: "2026-07-30",
        body: "A first order of GLOW arrived promptly, and the reviewer was pleased with both the product and the service given.",
      },
      {
        author: "Christine Saraceno",
        rating: 5,
        reviewedAt: "2026-07-30",
        body: "A great experience overall, with the reviewer reporting a straightforward order and helpful customer service.",
      },
    ],
  },
  {
    vendorName: "Pspeptides",
    domain: "pspeptides.com",
    rating: 4.3,
    trustpilotUrl: "https://www.trustpilot.com/review/pspeptides.com",
    reviews: [
      {
        author: "Harper",
        rating: 5,
        reviewedAt: "2026-09-08",
        body: "Wonderful customer service and good product purity, according to the reviewer, who had a positive experience.",
      },
      {
        author: "EE",
        rating: 1,
        reviewedAt: "2026-09-06",
        body: "The reviewer described the operation as a complete scam and reported a negative experience with their order.",
      },
      {
        author: "M W",
        rating: 1,
        reviewedAt: "2026-09-04",
        body: "The reviewer warns others against ordering, alleging that customers are scammed and left without any recourse.",
      },
      {
        author: "L Zarycky",
        rating: 1,
        reviewedAt: "2026-09-04",
        body: "A one-star rating was left on Trustpilot without written comments, indicating a clearly negative experience.",
      },
    ],
  },
  {
    vendorName: "Offline Peptides",
    domain: "offlinepeptides.com",
    rating: 4.8,
    trustpilotUrl: "https://www.trustpilot.com/review/offlinepeptides.com",
    reviews: [
      {
        author: "Alan",
        rating: 5,
        reviewedAt: "2026-08-18",
        body: "The order arrived on time and was accurate, and the reviewer reported a positive experience with the process.",
      },
      {
        author: "Vahn Filipiak",
        rating: 5,
        reviewedAt: "2026-08-18",
        body: "Excellent customer service and quick responses, with the reviewer highlighting clear communication throughout.",
      },
      {
        author: "Corey Walters",
        rating: 5,
        reviewedAt: "2026-08-17",
        body: "Great communication combined with fast delivery, and the reviewer reported no issues with the order at all.",
      },
      {
        author: "John Rose",
        rating: 5,
        reviewedAt: "2026-08-12",
        body: "Very happy with Offline Peptides overall, according to the reviewer, who praised the products and the service.",
      },
    ],
  },
  {
    vendorName: "Mission Peptides",
    domain: "missionpeptides.com",
    rating: 4.6,
    trustpilotUrl: "https://www.trustpilot.com/review/missionpeptides.com",
    reviews: [
      {
        author: "Linda shannon",
        rating: 5,
        reviewedAt: "2026-08-31",
        body: "Fast and easy from order through to delivery, with the reviewer reporting a positive experience with the company.",
      },
      {
        author: "Gloria Lawson",
        rating: 5,
        reviewedAt: "2026-08-03",
        body: "A repeat customer who has been using Mission Peptides regularly and continues to be satisfied with the service.",
      },
      {
        author: "Tim Bolduc",
        rating: 5,
        reviewedAt: "2026-08-01",
        body: "Quick and easy overall, with the reviewer reporting a smooth ordering process and prompt delivery of the order.",
      },
      {
        author: "Donna Lovett",
        rating: 5,
        reviewedAt: "2026-08-03",
        body: "The order was delivered within twenty-four hours, and the reviewer was impressed by the speed of the fulfillment.",
      },
      {
        author: "Drew Holton",
        rating: 5,
        reviewedAt: "2026-08-06",
        body: "Fast delivery noted by the reviewer, who received the order promptly and reported a positive experience overall.",
      },
    ],
  },
  {
    vendorName: "Peppy&Me",
    domain: "peppyandme.com",
    rating: 4.2,
    trustpilotUrl: "https://www.trustpilot.com/review/peppyandme.com",
    reviews: [
      {
        author: "JR Black",
        rating: 5,
        reviewedAt: "2026-09-05",
        body: "Described as an awesome company by the reviewer, who reported a positive experience with service and delivery.",
      },
    ],
  },
  {
    vendorName: "Cernumbiosciences",
    domain: "cernumbiosciences.com",
    rating: 3.4,
    trustpilotUrl: "https://www.trustpilot.com/review/cernumbiosciences.com",
    reviews: [
      {
        author: "Christopher",
        rating: 5,
        reviewedAt: "2026-07-19",
        body: "Described as a reliable and trusted source for peptides, with the reviewer reporting a positive order experience.",
      },
      {
        author: "P G",
        rating: 1,
        reviewedAt: "2026-03-03",
        body: "The reviewer advises against ordering from this company, citing an unsatisfactory experience with their own order.",
      },
      {
        author: "Esta N",
        rating: 5,
        reviewedAt: "2026-01-24",
        body: "A good experience overall, with the reviewer reporting a straightforward order and satisfactory service levels.",
      },
      {
        author: "bob roberts",
        rating: 1,
        reviewedAt: "2026-01-07",
        body: "The reviewer alleged that the company misled them and failed to return their money, describing a very poor experience.",
      },
    ],
  },
  {
    vendorName: "JD BioWorks",
    domain: "jdbioworks.com",
    rating: 4.3,
    trustpilotUrl: "https://www.trustpilot.com/review/jdbioworks.com",
    reviews: [
      {
        author: "Maia Marko",
        rating: 5,
        reviewedAt: "2026-09-08",
        body: "Very satisfied with all of the products received, and the reviewer reported a positive experience with the service.",
      },
      {
        author: "Isaac Reddick",
        rating: 5,
        reviewedAt: "2026-09-03",
        body: "JD BioWorks is amazing according to the reviewer, who was pleased with both the order and the support provided.",
      },
      {
        author: "Megan O",
        rating: 5,
        reviewedAt: "2026-08-12",
        body: "The reviewer credited Josh's insight and thoroughness as the standout part of their experience with the company.",
      },
      {
        author: "Sophia Hermida",
        rating: 5,
        reviewedAt: "2026-09-08",
        body: "The reviewer could not recommend the company more highly, citing dependable products and attentive service.",
      },
    ],
  },
  {
    vendorName: "Arctic Labs",
    domain: "arcticlabs.co",
    rating: 4,
    trustpilotUrl: "https://www.trustpilot.com/review/arcticlabs.co",
    reviews: [
      {
        author: "eruviel vasquez",
        rating: 5,
        reviewedAt: "2026-07-13",
        body: "The order arrived faster than the reviewer expected, and they reported a positive experience with the company.",
      },
      {
        author: "HateReborn",
        rating: 4,
        reviewedAt: "2026-06-06",
        body: "The package arrived as expected, though the reviewer noted a concern about the shipping charge they had paid.",
      },
      {
        author: "Ashley Rawlings",
        rating: 1,
        reviewedAt: "2026-06-09",
        body: "The reviewer received only part of their order and had to follow up, resulting in an unsatisfactory experience.",
      },
      {
        author: "Ian R",
        rating: 5,
        reviewedAt: "2026-03-27",
        body: "An order of two vials of Reta plus two BPC and TB items arrived as expected, and the reviewer was satisfied.",
      },
      {
        author: "Aaron Lentini",
        rating: 5,
        reviewedAt: "2026-03-24",
        body: "Amazing quality and service, according to the reviewer, who reported a smooth order and a prompt delivery.",
      },
    ],
  },
  {
    vendorName: "Rejuven8peptides",
    domain: "rejuven8peptides.com",
    rating: 4.7,
    trustpilotUrl: "https://www.trustpilot.com/review/rejuven8peptides.com",
    reviews: [
      {
        author: "Devin Brown",
        rating: 5,
        reviewedAt: "2026-08-20",
        body: "Customer service is good and payment was straightforward, with the reviewer reporting a smooth order experience.",
      },
      {
        author: "Adam",
        rating: 5,
        reviewedAt: "2026-08-18",
        body: "An amazing experience overall, with the reviewer satisfied with the products received and the service provided.",
      },
      {
        author: "Bob",
        rating: 5,
        reviewedAt: "2026-08-06",
        body: "A great company with excellent customer service, according to the reviewer, who had no issues with their order.",
      },
      {
        author: "Ann Jazwinski",
        rating: 5,
        reviewedAt: "2026-06-26",
        body: "Described as an absolutely amazing company by the reviewer, who praised both the products and the service.",
      },
      {
        author: "Big Bo",
        rating: 5,
        reviewedAt: "2026-04-10",
        body: "Customer service was second to none in the reviewer's experience, and the order process went smoothly throughout.",
      },
    ],
  },
  {
    vendorName: "Pepta Supply",
    domain: "peptasupply.com",
    rating: 4.3,
    trustpilotUrl: "https://www.trustpilot.com/review/peptasupply.com",
    reviews: [
      {
        author: "Mike",
        rating: 5,
        reviewedAt: "2026-07-27",
        body: "Fast delivery and helpful customer service, with the reviewer reporting a positive experience with the order.",
      },
      {
        author: "Pamela Puk",
        rating: 5,
        reviewedAt: "2026-07-10",
        body: "Super fast delivery backed by strong support, according to the reviewer, who was pleased with the whole process.",
      },
      {
        author: "Asdien",
        rating: 5,
        reviewedAt: "2026-06-19",
        body: "Great products and excellent service, with the reviewer reporting a straightforward and trouble-free order.",
      },
      {
        author: "Anton",
        rating: 5,
        reviewedAt: "2026-06-10",
        body: "A returning customer who has ordered peptides from Pepta Supply before and remains satisfied with the service.",
      },
      {
        author: "Musa Helmendag",
        rating: 5,
        reviewedAt: "2026-05-19",
        body: "A great experience overall, with the reviewer reporting a smooth order and satisfaction with the products.",
      },
    ],
  },
  {
    vendorName: "Real Peptides",
    domain: "realpeptides.co",
    rating: 4.2,
    trustpilotUrl: "https://www.trustpilot.com/review/realpeptides.co",
    reviews: [
      {
        author: "Persons",
        rating: 5,
        reviewedAt: "2026-09-10",
        body: "A very good company with very good service, according to the reviewer, who was satisfied with their order.",
      },
      {
        author: "Jan",
        rating: 5,
        reviewedAt: "2026-09-10",
        body: "Amazing customer service, with the reviewer highlighting prompt and helpful responses during the order process.",
      },
      {
        author: "Josh Hudson",
        rating: 5,
        reviewedAt: "2026-09-04",
        body: "Good service overall, with the reviewer reporting a straightforward order and no issues with the delivery.",
      },
      {
        author: "Jay",
        rating: 5,
        reviewedAt: "2026-09-08",
        body: "Excellent customer service, according to the reviewer, who found the team responsive and easy to deal with.",
      },
      {
        author: "Amy Heald",
        rating: 5,
        reviewedAt: "2026-09-07",
        body: "The reviewer had nothing but good things to say about the company, praising both the products and service.",
      },
    ],
  },
];

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

const BY_NAME = new Map(VENDOR_REVIEW_PROFILES.map((p) => [normalizeName(p.vendorName), p]));
const BY_DOMAIN = new Map(
  VENDOR_REVIEW_PROFILES.flatMap((p) => (p.domain ? [[p.domain, p] as const] : [])),
);

/**
 * Finds the review profile for a vendor by name, falling back to its website
 * domain, several vendors are listed in the sheet under a different display
 * name than the catalogue uses (e.g. "Rivn Peptides" vs "RIVN Research"), and
 * the domain is the reliable identifier in those cases.
 */
export function findVendorReviewProfile(
  vendorName: string,
  homepageUrl?: string | null,
): VendorReviewProfile | null {
  const byName = BY_NAME.get(normalizeName(vendorName));
  if (byName) return byName;
  const host = hostOf(homepageUrl);
  return host ? BY_DOMAIN.get(host) ?? null : null;
}
