// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import CarrierBadge from '../../../src/renderer/components/CarrierBadge';
import ChemicalResistanceBadge from '../../../src/renderer/components/ChemicalResistanceBadge';
import DispersibilityBadge from '../../../src/renderer/components/DispersibilityBadge';
import DrugSolubilityBadge from '../../../src/renderer/components/DrugSolubilityBadge';
import PlasticizerBadge from '../../../src/renderer/components/PlasticizerBadge';
import SwellingBadge from '../../../src/renderer/components/SwellingBadge';
import WettabilityBadge from '../../../src/renderer/components/WettabilityBadge';

import {
  CarrierCompatibilityLevel,
  ChemicalResistanceLevel,
  DispersibilityLevel,
  DrugSolubilityLevel,
  PlasticizerCompatibilityLevel,
  SwellingLevel,
  WettabilityLevel,
} from '../../../src/core/types';

describe('CarrierBadge', () => {
  it('優秀レベルを正しく表示', () => {
    render(<CarrierBadge level={CarrierCompatibilityLevel.Excellent} red={0.3} />);
    expect(screen.getByText('優秀')).toBeInTheDocument();
    expect(screen.getByText('(RED: 0.300)')).toBeInTheDocument();
  });

  it('不適レベルを正しく表示', () => {
    render(<CarrierBadge level={CarrierCompatibilityLevel.Incompatible} />);
    expect(screen.getByText('不適')).toBeInTheDocument();
  });

  it('red省略時にRED表示なし', () => {
    render(<CarrierBadge level={CarrierCompatibilityLevel.Good} />);
    expect(screen.getByText('良好')).toBeInTheDocument();
    expect(screen.queryByText(/RED/)).not.toBeInTheDocument();
  });
});

describe('ChemicalResistanceBadge', () => {
  it('優秀レベルを正しく表示', () => {
    render(<ChemicalResistanceBadge level={ChemicalResistanceLevel.Excellent} red={3.5} />);
    expect(screen.getByText('優秀')).toBeInTheDocument();
    expect(screen.getByText('(RED: 3.500)')).toBeInTheDocument();
  });

  it('耐性なしを正しく表示', () => {
    render(<ChemicalResistanceBadge level={ChemicalResistanceLevel.NoResistance} />);
    expect(screen.getByText('耐性なし')).toBeInTheDocument();
  });
});

describe('DispersibilityBadge', () => {
  it('優秀レベルを正しく表示', () => {
    render(<DispersibilityBadge level={DispersibilityLevel.Excellent} red={0.2} />);
    expect(screen.getByText('優秀')).toBeInTheDocument();
    expect(screen.getByText('(RED: 0.200)')).toBeInTheDocument();
  });

  it('不可レベルを正しく表示', () => {
    render(<DispersibilityBadge level={DispersibilityLevel.Bad} />);
    expect(screen.getByText('不可')).toBeInTheDocument();
  });
});

describe('DrugSolubilityBadge', () => {
  it('優秀レベルを正しく表示', () => {
    render(<DrugSolubilityBadge level={DrugSolubilityLevel.Excellent} red={0.3} />);
    expect(screen.getByText('優秀')).toBeInTheDocument();
  });

  it('不溶を正しく表示', () => {
    render(<DrugSolubilityBadge level={DrugSolubilityLevel.Insoluble} />);
    expect(screen.getByText('不溶')).toBeInTheDocument();
  });
});

describe('PlasticizerBadge', () => {
  it('優秀レベルを正しく表示', () => {
    render(<PlasticizerBadge level={PlasticizerCompatibilityLevel.Excellent} red={0.3} />);
    expect(screen.getByText('優秀')).toBeInTheDocument();
  });

  it('不相溶を正しく表示', () => {
    render(<PlasticizerBadge level={PlasticizerCompatibilityLevel.Incompatible} />);
    expect(screen.getByText('不相溶')).toBeInTheDocument();
  });
});

describe('SwellingBadge', () => {
  it('著しい膨潤を正しく表示', () => {
    render(<SwellingBadge level={SwellingLevel.Severe} red={0.2} />);
    expect(screen.getByText('著しい膨潤')).toBeInTheDocument();
    expect(screen.getByText('(RED: 0.200)')).toBeInTheDocument();
  });

  it('膨潤なしを正しく表示', () => {
    render(<SwellingBadge level={SwellingLevel.Negligible} />);
    expect(screen.getByText('膨潤なし')).toBeInTheDocument();
  });
});

describe('WettabilityBadge', () => {
  it('超親水を角度付きで表示', () => {
    render(<WettabilityBadge level={WettabilityLevel.SuperHydrophilic} angle={5.2} />);
    expect(screen.getByText('超親水')).toBeInTheDocument();
    expect(screen.getByText('(5.2°)')).toBeInTheDocument();
  });

  it('超撥水を正しく表示', () => {
    render(<WettabilityBadge level={WettabilityLevel.SuperHydrophobic} />);
    expect(screen.getByText('超撥水')).toBeInTheDocument();
  });

  it('角度省略時に角度表示なし', () => {
    render(<WettabilityBadge level={WettabilityLevel.Hydrophilic} />);
    expect(screen.getByText('親水')).toBeInTheDocument();
    expect(screen.queryByText(/°/)).not.toBeInTheDocument();
  });
});
