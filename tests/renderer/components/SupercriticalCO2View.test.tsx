// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { setupMockApi } from '../setup';
import SupercriticalCO2View from '../../../src/renderer/components/SupercriticalCO2View';

describe('SupercriticalCO2View', () => {
  beforeEach(() => {
    setupMockApi();
  });

  it('タイトルが表示される', () => {
    render(<SupercriticalCO2View />);
    expect(screen.getByText('超臨界CO2共溶媒選定')).toBeInTheDocument();
  });

  it('ターゲット物質セクションが表示される', () => {
    render(<SupercriticalCO2View />);
    expect(screen.getByText('ターゲット物質')).toBeInTheDocument();
  });

  it('超臨界CO2条件セクションが表示される', () => {
    render(<SupercriticalCO2View />);
    expect(screen.getByText('超臨界CO2条件')).toBeInTheDocument();
  });

  it('共溶媒候補セクションが表示される', () => {
    render(<SupercriticalCO2View />);
    expect(screen.getByText('共溶媒候補')).toBeInTheDocument();
  });

  it('プリセット共溶媒が表示される', () => {
    render(<SupercriticalCO2View />);
    // Check for ethanol and methanol in the checkboxes
    expect(screen.getByText(/エタノール/)).toBeInTheDocument();
    expect(screen.getByText(/メタノール/)).toBeInTheDocument();
  });

  it('評価ボタンが表示される', () => {
    render(<SupercriticalCO2View />);
    expect(screen.getByText('超臨界CO2評価')).toBeInTheDocument();
  });
});
