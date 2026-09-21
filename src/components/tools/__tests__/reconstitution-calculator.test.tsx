// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ReconstitutionCalculator } from '../reconstitution-calculator';

afterEach(cleanup);

function setField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('ReconstitutionCalculator', () => {
  it('opens on Find Units with a worked 10 mg / 2 mL / 500 mcg example', () => {
    render(<ReconstitutionCalculator />);
    expect(screen.getByText('5,000')).toBeTruthy();
    expect(screen.getByText('5.00 mg / mL')).toBeTruthy();
    expect(screen.getByText('0.100 mL')).toBeTruthy();
    expect(screen.getByText('10.0 units')).toBeTruthy();
    expect(screen.getByText(/Each vial covers 20 days at 1 dose\/day \(you'll need ~1\.5 vials for a 30-day cycle\)/)).toBeTruthy();
  });

  it('Find Dose turns 18 units from a 5 mg / 2 mL vial into 450 mcg', () => {
    render(<ReconstitutionCalculator />);
    fireEvent.click(screen.getByRole('button', { name: /find dose/i }));
    setField('Vial size (mg)', '5');
    setField('BAC water (mL)', '2');
    setField('Syringe units', '18');
    expect(screen.getByText('450 mcg')).toBeTruthy();
    expect(screen.getByText('0.180 mL')).toBeTruthy();
  });

  it('Find Dose reports the actual dose from the units drawn, not the target dose', () => {
    render(<ReconstitutionCalculator />);
    fireEvent.click(screen.getByRole('button', { name: /find dose/i }));
    setField('Vial size (mg)', '5');
    setField('BAC water (mL)', '5');
    setField('Target dose (mcg)', '500');
    setField('Syringe units', '10');
    expect(screen.getByText('1,000')).toBeTruthy();
    expect(screen.getByText('1.00 mg / mL')).toBeTruthy();
    // "100 mcg" is also a dose preset chip, so read it from the result row itself.
    expect(screen.getByText('Actual dose').parentElement?.textContent).toBe('Actual dose100 mcg');
    expect(screen.getByText('0.100 mL')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
    expect(screen.getByText(/Each vial covers 50 days at 1 dose\/day \(you'll need ~0\.6 vials for a 30-day cycle\)/)).toBeTruthy();
  });

  it('Find BAC Water lands 250 mcg on the 25-unit mark of a 5 mg vial with 5 mL', () => {
    render(<ReconstitutionCalculator />);
    fireEvent.click(screen.getByRole('button', { name: /find bac water/i }));
    setField('Vial size (mg)', '5');
    setField('Target dose (mcg)', '250');
    setField('Target syringe units', '25');
    expect(screen.getByText('5.00 mL')).toBeTruthy();
    expect(screen.getByText('1,000')).toBeTruthy();
  });

  it('warns when the draw is larger than the chosen syringe', () => {
    render(<ReconstitutionCalculator />);
    setField('Target dose (mcg)', '2000');
    fireEvent.click(screen.getByRole('button', { name: /U-30/ }));
    expect(screen.getByText(/40 units is more than a U-30 syringe holds \(30 units\)/)).toBeTruthy();
  });

  it('shows dashes instead of numbers while a required field is empty', () => {
    render(<ReconstitutionCalculator />);
    setField('BAC water (mL)', '');
    expect(screen.getByText('Fill in every field to calculate.')).toBeTruthy();
    expect(screen.queryByText('10.0 units')).toBeNull();
  });
});
