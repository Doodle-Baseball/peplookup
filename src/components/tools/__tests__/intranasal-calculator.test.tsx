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
    expect(rowText('Actuations per bottle')).toBe('Actuations per bottle200');
    expect(rowText('Cost per actuation')).toBe('Cost per actuation$0.2250');
  });

  it('offers only Semax, Selank and Custom', () => {
    render(<IntranasalCalculator />);
    const presets = screen.getByRole('group', { name: 'Peptide' }).querySelectorAll('button');
    expect(Array.from(presets, (button) => button.textContent)).toEqual(['Semax 0.25%', 'Selank 0.05%', 'Custom']);
  });

  it.each([
    ['Selank 0.05%', '500 mcg / mL', '25'],
    ['Custom', '1,000 mcg / mL', '50'],
  ])('%s loads its own vial and water', (label, concentration, mcgPerActuation) => {
    render(<IntranasalCalculator />);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(screen.getByText(concentration)).toBeTruthy();
    expect(screen.getByText(mcgPerActuation)).toBeTruthy();
    expect(rowText('Cost per actuation')).toBe('Cost per actuation$0.2250');
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

  it('recalculates for a smaller pump', () => {
    render(<IntranasalCalculator />);
    fireEvent.click(screen.getByRole('button', { name: /50 per mL/ }));
    expect(screen.getByText('60')).toBeTruthy();
    expect(rowText('Actuations per bottle')).toBe('Actuations per bottle500');
    expect(rowText('Cost per actuation')).toBe('Cost per actuation$0.0900');
  });

  it('Selank in 15 mL with a 1 mL bottle at 10 per mL', () => {
    render(<IntranasalCalculator />);
    fireEvent.click(screen.getByRole('button', { name: 'Selank 0.05%' }));
    fireEvent.click(screen.getByRole('button', { name: '15 mL' }));
    setField('Bottle volume (mL)', '1');
    fireEvent.click(screen.getByRole('button', { name: /10 per mL/ }));
    expect(screen.getByText('33')).toBeTruthy();
    expect(rowText('Actuations per bottle')).toBe('Actuations per bottle10');
    expect(rowText('Cost per actuation')).toBe('Cost per actuation$4.5000');
  });

  it('a 1 mL bottle at the standard 20 per mL', () => {
    render(<IntranasalCalculator />);
    setField('Bottle volume (mL)', '1');
    setField('Vial price (optional)', '45');
    expect(rowText('Actuations per bottle')).toBe('Actuations per bottle20');
    expect(rowText('Cost per actuation')).toBe('Cost per actuation$2.2500');
  });

  it('shows costs as empty when no price is entered', () => {
    render(<IntranasalCalculator />);
    setField('Vial price (optional)', '');
    expect(rowText('Cost per actuation')).toBe('Cost per actuation-');
    expect(screen.getByText('150')).toBeTruthy();
  });
});
