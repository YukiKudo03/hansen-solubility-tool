// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { setupMockApi } from '../setup';
import TemperatureHSPCorrectionView from '../../../src/renderer/components/TemperatureHSPCorrectionView';

describe('TemperatureHSPCorrectionView', () => {
  beforeEach(() => {
    setupMockApi();
  });

  it('タイトルが表示される', () => {
    render(<TemperatureHSPCorrectionView />);
    expect(screen.getByText('温度依存HSP補正ツール')).toBeInTheDocument();
  });

  it('入力フィールドが表示される', () => {
    render(<TemperatureHSPCorrectionView />);
    expect(screen.getByText('dD (MPa^0.5)')).toBeInTheDocument();
    expect(screen.getByText('dP (MPa^0.5)')).toBeInTheDocument();
    expect(screen.getByText('dH (MPa^0.5)')).toBeInTheDocument();
  });

  it('実行ボタンが表示される', () => {
    render(<TemperatureHSPCorrectionView />);
    expect(screen.getByText('温度補正を実行')).toBeInTheDocument();
  });

  it('会合性液体選択が表示される', () => {
    render(<TemperatureHSPCorrectionView />);
    expect(screen.getByText('会合性液体')).toBeInTheDocument();
  });
});
