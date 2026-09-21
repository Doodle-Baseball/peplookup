// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IntranasalCalculator } from '../intranasal-calculator';

afterEach(cleanup);

function setField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function rowText(label: string): string | null | undefined {
  return screen.getByText(label).parentElement?.textContent;
}

describe('IntranasalCalculator', () => {
  it('opens on Semax 0.25% with 30 mg in 10 mL', () => {
    render(<IntranasalCalculator />);
    expect(screen.getByText('3,000 mcg / mL')).toBeTruthy();
    expect(screen.getByText('150')).toBeTruthy();
    expect(screen.getByText('300 mcg per 2-spray dose')).toBeTruthy();
    expect(rowText('Sprays per bottle')).toBe('Sprays per bottle200');
    expect(rowText('Doses per bottle')).toBe('Doses per bottle100');
    expect(rowText('Cost per spray')).toBe('Cost per spray$0.2250');
    expect(rowText('Cost per dose')).toBe('Cost per dose$0.450');
  });

  it.each([
    ['Selank 0.05%', '500 mcg / mL', '25', '50 mcg per 2-spray dose'],
    ['PT-141 (Bremelanotide)', '1,000 mcg / mL', '50', '100 mcg per 2-spray dose'],
    ['Melanotan II', '1,000 mcg / mL', '50', '100 mcg per 2-spray dose'],
    ['Custom', '1,000 mcg / mL', '50', '100 mcg per 2-spray dose'],
  ])('%s loads its own vial and water', (label, concentration, mcgPerSpray, perDose) => {
    render(<IntranasalCalculator />);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(screen.getByText(concentration)).toBeTruthy();
    expect(screen.getByText(mcgPerSpray)).toBeTruthy();
    expect(screen.getByText(perDose)).toBeTruthy();
    expect(rowText('Cost per spray')).toBe('Cost per spray$0.2250');
  });

  it('locks the vial size for named peptides and unlocks it for Custom', () => {
    render(<IntranasalCalculator />);
    const vial = () => screen.getByLabelText('Vial size (mg)') as HTMLInputElement;
    expect(vial().readOnly).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));
    expect(vial().readOnly).toBe(false);
    setField('Vial size (mg)', '20');
    expect(screen.getByText('2,000 mcg / mL')).toBeTruthy();
  });

  it('recalculates for a finer spray rate', () => {
    render(<IntranasalCalculator />);
    fireEvent.click(screen.getByRole('button', { name: /50 sprays \/ mL/ }));
    expect(screen.getByText('60')).toBeTruthy();
    expect(rowText('Sprays per bottle')).toBe('Sprays per bottle500');
    expect(rowText('Cost per spray')).toBe('Cost per spray$0.0900');
  });

  it('Selank in 15 mL with a 1 mL bottle and a 12-spray dose', () => {
    render(<IntranasalCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Selank 0.05%' }));
    fireEvent.click(screen.getByRole('button', { name: '15 mL' }));
    setField('Bottle volume (mL)', '1');
    setField('Dose (sprays)', '12');
    fireEvent.click(screen.getByRole('button', { name: /10 sprays \/ mL/ }));
    expect(screen.getByText('33')).toBeTruthy();
    expect(screen.getByText('400 mcg per 12-spray dose')).toBeTruthy();
    expect(rowText('Sprays per bottle')).toBe('Sprays per bottle10');
    expect(rowText('Doses per bottle')).toBe('Doses per bottle0');
    expect(rowText('Cost per spray')).toBe('Cost per spray$4.5000');
    expect(rowText('Cost per dose')).toBe('Cost per dose$54.000');
  });

  it('a 1 mL bottle at the standard 20 sprays/mL with a 12-spray dose', () => {
    render(<IntranasalCalculator />);
    setField('Bottle volume (mL)', '1');
    setField('Dose (sprays)', '12');
    setField('Vial price (optional)', '45');
    expect(rowText('Sprays per bottle')).toBe('Sprays per bottle20');
    expect(rowText('Doses per bottle')).toBe('Doses per bottle1');
    expect(rowText('Cost per spray')).toBe('Cost per spray$2.2500');
    expect(rowText('Cost per dose')).toBe('Cost per dose$27.000');
  });

  it('shows costs as empty when no price is entered', () => {
    render(<IntranasalCalculator />);
    setField('Vial price (optional)', '');
    expect(rowText('Cost per spray')).toBe('Cost per spray-');
    expect(rowText('Cost per dose')).toBe('Cost per dose-');
    expect(screen.getByText('150')).toBeTruthy();
  });
});
