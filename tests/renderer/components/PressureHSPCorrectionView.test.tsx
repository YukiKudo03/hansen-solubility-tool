// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { setupMockApi } from '../setup';
import PressureHSPCorrectionView from '../../../src/renderer/components/PressureHSPCorrectionView';

describe('PressureHSPCorrectionView', () => {
  beforeEach(() => {
    setupMockApi();
  });

  it('タイトルが表示される', () => {
    render(<PressureHSPCorrectionView />);
    expect(screen.getByText('圧力依存HSP補正ツール')).toBeInTheDocument();
  });

  it('入力フィールドが表示される', () => {
    render(<PressureHSPCorrectionView />);
    expect(screen.getByText('dD (MPa^0.5)')).toBeInTheDocument();
    expect(screen.getByText('目標圧力 (MPa)')).toBeInTheDocument();
    expect(screen.getByText('温度 (K)')).toBeInTheDocument();
  });

  it('実行ボタンが表示される', () => {
    render(<PressureHSPCorrectionView />);
    expect(screen.getByText('圧力補正を実行')).toBeInTheDocument();
  });

  it('等温圧縮率フィールドが表示される', () => {
    render(<PressureHSPCorrectionView />);
    expect(screen.getByText('等温圧縮率 (1/MPa)')).toBeInTheDocument();
  });
});
