import 'server-only';
import { getAllOffers, getProducts, getSuppliers } from '@/lib/repository';
import { buildPriceDataset, type PriceDataset } from '@/lib/dataset-export';

/** Reads the same offers, suppliers and compounds the public pages show, so a COA counts only if the site publishes it. */
export async function loadPriceDataset(now: Date = new Date()): Promise<PriceDataset> {
  const [offers, suppliers, products] = await Promise.all([getAllOffers(), getSuppliers(), getProducts()]);
  return buildPriceDataset({ offers, suppliers, products, now });
}
