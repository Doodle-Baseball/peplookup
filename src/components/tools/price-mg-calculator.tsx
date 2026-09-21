'use client';

import { useState } from 'react';
import { formatMoney, formatPerMg, cents } from '@/lib/money';
import { BoxIcon, FlaskIcon, TagIcon, TruckIcon } from '@/components/icons/icons';
import { CalcField, CalcResultRow, PresetChips, parsePositive } from '@/components/tools/calc-ui';

const VIAL_SIZE_PRESETS = [5, 10, 15, 20, 30, 50];
const DOSE_PRESETS = [100, 250, 500, 1000];

export function PriceMgCalculator() {
  const [totalPrice, setTotalPrice] = useState('49.99');
  const [vialSize, setVialSize] = useState('10');
  const [vialCount, setVialCount] = useState('1');
  const [shipping, setShipping] = useState('0');
  const [desiredDose, setDesiredDose] = useState('500');

  const price = parsePositive(totalPrice);
  const mgPerVial = parsePositive(vialSize);
  const vials = parsePositive(vialCount);
  const shippingCost = parsePositive(shipping);
  const doseMcg = parsePositive(desiredDose);

  const totalMg = mgPerVial * vials;
  const perMgDollars = totalMg > 0 ? price / totalMg : null;
  const totalCost = price + shippingCost;
  const dosesPerVial = doseMcg > 0 && mgPerVial > 0 ? Math.floor((mgPerVial * 1000) / doseMcg) : null;
  const totalDoses = dosesPerVial !== null ? dosesPerVial * vials : null;
  const costPerDose = totalDoses && totalDoses > 0 ? totalCost / totalDoses : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* Inputs */}
      <div className="tilt-card rounded-card border border-line bg-surface-raised p-6 sm:p-7">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-brand-soft text-brand-strong">
            <FlaskIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-content">Vial Pricing</h2>
            <p className="text-sm text-muted">Enter the supplier&rsquo;s price and vial size.</p>
          </div>
        </div>

        <div className="mt-5">
          <CalcField label="Total price (USD)" icon={null} prefix="$" value={totalPrice} onChange={setTotalPrice} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <CalcField label="Vial size (mg)" icon={<FlaskIcon className="h-4 w-4" />} value={vialSize} onChange={setVialSize} />
            <PresetChips values={VIAL_SIZE_PRESETS} suffix="mg" active={vialSize} onPick={setVialSize} />
          </div>
          <CalcField
            label="Number of vials"
            icon={<BoxIcon className="h-4 w-4" />}
            value={vialCount}
            onChange={setVialCount}
            step="1"
          />
        </div>

        <div className="mt-5">
          <CalcField label="Shipping cost (optional)" icon={<TruckIcon className="h-4 w-4" />} value={shipping} onChange={setShipping} />
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <CalcField
            label="Desired dose (mcg): for cost per dose"
            icon={<TagIcon className="h-4 w-4" />}
            value={desiredDose}
            onChange={setDesiredDose}
          />
          <PresetChips values={DOSE_PRESETS} suffix="mcg" active={desiredDose} onPick={setDesiredDose} />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-card border border-brand/25 bg-brand-tint p-6 shadow-card">
          <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
          <p className="relative text-xs font-bold uppercase tracking-wide text-brand-strong">Price / mg</p>
          <p className="relative mt-2 flex items-baseline gap-1.5">
            <span className="text-5xl font-black tracking-tight text-content">
              {perMgDollars !== null ? formatMoney(cents(perMgDollars * 100), 'USD') : '$0.00'}
            </span>
            <span className="text-lg font-bold text-muted">/ mg</span>
          </p>
          <p className="relative mt-1 text-xs text-muted">
            {perMgDollars !== null ? formatPerMg(perMgDollars * 100, 'USD') : '$0.00/mg'} before shipping
          </p>
        </div>

        <div className="tilt-card rounded-card border border-line bg-surface-raised px-6">
          <CalcResultRow label="Total cost" value={formatMoney(cents(totalCost * 100), 'USD')} />
          <CalcResultRow label="Total peptide" value={`${totalMg.toFixed(1)} mg`} />
          <CalcResultRow label="Subtotal" value={formatMoney(cents(price * 100), 'USD')} />
          <CalcResultRow label="Doses per vial" value={dosesPerVial !== null ? String(dosesPerVial) : ''} accent />
          <CalcResultRow
            label="Cost per dose"
            value={costPerDose !== null ? formatMoney(cents(costPerDose * 100), 'USD') : ''}
            accent
          />
        </div>
      </div>
    </div>
  );
}
