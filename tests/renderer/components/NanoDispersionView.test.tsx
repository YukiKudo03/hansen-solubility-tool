// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NanoDispersionView from '../../../src/renderer/components/NanoDispersionView';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';
import { DispersibilityLevel } from '../../../src/core/types';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

const particle = {
  id: 1,
  name: 'SWCNT',
  nameEn: 'Single-Wall CNT',
  category: 'carbon' as const,
  coreMaterial: 'Carbon',
  surfaceLigand: null,
  hsp: { deltaD: 17.8, deltaP: 7.0, deltaH: 7.6 },
  r0: 3.5,
  particleSize: 1.2,
  notes: null,
};

function buildNanoResult() {
  return {
    nanoParticle: particle,
    results: [
      {
        nanoParticle: particle,
        solvent: buildSolvent({ name: 'NMP' }),
        ra: 1.0,
        red: 0.29,
        dispersibility: DispersibilityLevel.Excellent,
      },
      {
        nanoParticle: particle,
        solvent: buildSolvent({ name: 'DMF' }),
        ra: 2.5,
        red: 0.71,
        dispersibility: DispersibilityLevel.Good,
      },
    ],
    evaluatedAt: new Date('2026-03-15'),
    thresholdsUsed: { excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 },
  };
}

describe('NanoDispersionView', () => {
  it('タイトルが表示される', () => {
    mockApi.getAllNanoParticles.mockResolvedValue([]);

    render(<NanoDispersionView />);

    expect(screen.getByText('ナノ粒子分散評価')).toBeInTheDocument();
  });

  it('カテゴリフィルタが表示される', () => {
    mockApi.getAllNanoParticles.mockResolvedValue([]);

    render(<NanoDispersionView />);

    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('すべて')).toBeInTheDocument();
  });

  it('ナノ粒子を選択してスクリーニング実行後に結果が表示される', async () => {
    const user = userEvent.setup();
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.screenAllSolvents.mockResolvedValue(buildNanoResult());

    render(<NanoDispersionView />);

    // 粒子選択
    await waitFor(() => expect(screen.getByText(/SWCNT/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    const particleSelect = selects[selects.length - 1];
    await user.selectOptions(particleSelect, String(particle.id));

    // スクリーニング実行
    await user.click(screen.getByText('全溶媒スクリーニング'));

    await waitFor(() => {
      expect(screen.getByText(/最適溶媒/)).toBeInTheDocument();
      expect(screen.getAllByText('NMP').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('DMF').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('CSV出力ボタンが結果表示後に出現', async () => {
    const user = userEvent.setup();
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.screenAllSolvents.mockResolvedValue(buildNanoResult());

    render(<NanoDispersionView />);

    expect(screen.queryByText('CSV出力')).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/SWCNT/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[selects.length - 1], String(particle.id));
    await user.click(screen.getByText('全溶媒スクリーニング'));

    await waitFor(() => {
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージ表示', async () => {
    const user = userEvent.setup();
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.screenAllSolvents.mockRejectedValue(new Error('分散エラー'));

    render(<NanoDispersionView />);

    await waitFor(() => expect(screen.getByText(/SWCNT/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[selects.length - 1], String(particle.id));
    await user.click(screen.getByText('全溶媒スクリーニング'));

    await waitFor(() => {
      expect(screen.getByText('分散エラー')).toBeInTheDocument();
    });
  });
});
