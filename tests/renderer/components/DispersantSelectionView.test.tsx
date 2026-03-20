// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DispersantSelectionView from '../../../src/renderer/components/DispersantSelectionView';
import { setupMockApi } from '../setup';
import { resetIdCounter, buildSolvent } from '../factories';
import { DispersantAffinityLevel } from '../../../src/core/types';
import type { NanoParticle, Dispersant, DispersantEvaluationResult, DispersantFallbackResult } from '../../../src/core/types';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

const particle: NanoParticle = {
  id: 1, name: 'カーボンブラック', nameEn: 'Carbon Black',
  category: 'carbon', coreMaterial: 'CB', surfaceLigand: null,
  hsp: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 }, r0: 6.1,
  particleSize: 20, notes: null,
};

const dispersant: Dispersant = {
  id: 1, name: 'BYK-163', nameEn: 'BYK-163',
  dispersantType: 'polymeric',
  anchorHSP: { deltaD: 19.5, deltaP: 9.0, deltaH: 7.5 }, anchorR0: 6.5,
  solvationHSP: { deltaD: 16.5, deltaP: 4.5, deltaH: 5.0 }, solvationR0: 8.0,
  overallHSP: { deltaD: 17.8, deltaP: 6.5, deltaH: 6.0 },
  hlb: null, molWeight: 8000, tradeName: 'BYK-163', manufacturer: 'BYK-Chemie', notes: null,
};

function buildScreenResult(): DispersantEvaluationResult {
  return {
    particle,
    solvent: buildSolvent({ name: 'NMP' }),
    results: [
      {
        dispersant,
        particle,
        solvent: buildSolvent({ name: 'NMP' }),
        raAnchor: 5.5, redAnchor: 0.85,
        affinityAnchor: DispersantAffinityLevel.Fair,
        raSolvation: 4.2, redSolvation: 0.52,
        affinitySolvation: DispersantAffinityLevel.Good,
        compositeScore: 0.665,
        overallLevel: DispersantAffinityLevel.Fair,
      },
    ],
    evaluatedAt: new Date('2026-03-20'),
    thresholdsUsed: { excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 },
  };
}

function buildFallbackResult(): DispersantFallbackResult[] {
  return [
    {
      dispersant,
      particle,
      solvent: null as any,
      raOverall: 3.0, redOverall: 0.49,
      affinity: DispersantAffinityLevel.Excellent,
    },
  ];
}

describe('DispersantSelectionView', () => {
  it('タイトルが表示される', async () => {
    render(<DispersantSelectionView />);
    expect(screen.getByText('分散剤選定')).toBeInTheDocument();
  });

  it('3つのモードボタンが表示される', async () => {
    render(<DispersantSelectionView />);
    expect(screen.getByText('分散剤スクリーニング')).toBeInTheDocument();
    expect(screen.getByText('溶媒スクリーニング')).toBeInTheDocument();
    expect(screen.getByText('簡易評価（全体HSP）')).toBeInTheDocument();
  });

  it('ナノ粒子セレクタが表示される', () => {
    render(<DispersantSelectionView />);
    expect(screen.getByText('ナノ粒子')).toBeInTheDocument();
  });

  it('スクリーニング実行ボタンが表示される', () => {
    render(<DispersantSelectionView />);
    expect(screen.getByText('スクリーニング実行')).toBeInTheDocument();
  });

  it('初期状態でAPIが呼ばれる', async () => {
    render(<DispersantSelectionView />);
    await waitFor(() => {
      expect(mockApi.getAllNanoParticles).toHaveBeenCalled();
      expect(mockApi.getAllSolvents).toHaveBeenCalled();
    });
  });

  it('説明テキストが表示される', () => {
    render(<DispersantSelectionView />);
    expect(screen.getByText(/アンカー基/)).toBeInTheDocument();
    expect(screen.getByText(/溶媒和鎖/)).toBeInTheDocument();
  });

  it('粒子選択で情報パネルが表示される', async () => {
    const user = userEvent.setup();
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.getAllSolvents.mockResolvedValue([buildSolvent({ name: 'NMP' })]);

    render(<DispersantSelectionView />);

    await waitFor(() => expect(screen.getByText(/カーボンブラック/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    // 粒子セレクタ（2番目のcombobox: カテゴリの次）
    await user.selectOptions(selects[1], String(particle.id));

    await waitFor(() => {
      expect(screen.getByText(/δD:/)).toBeInTheDocument();
      expect(screen.getByText(/R₀:/)).toBeInTheDocument();
      expect(screen.getByText(/粒子径:/)).toBeInTheDocument();
    });
  });

  it('分散剤スクリーニング実行後に統計サマリーと精度警告が表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ id: 10, name: 'NMP' });
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.getAllSolvents.mockResolvedValue([solvent]);
    mockApi.getAllDispersants.mockResolvedValue([dispersant]);
    mockApi.screenDispersants.mockResolvedValue(buildScreenResult());

    render(<DispersantSelectionView />);

    // 粒子と溶媒の選択
    await waitFor(() => expect(mockApi.getAllNanoParticles).toHaveBeenCalled());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], String(particle.id));
    await user.selectOptions(selects[2], String(solvent.id));

    // 実行ボタンを押す
    const btn = screen.getByText('スクリーニング実行');
    await user.click(btn);

    // screenDispersantsが呼ばれたことを確認
    await waitFor(() => {
      expect(mockApi.screenDispersants).toHaveBeenCalledWith(particle.id, solvent.id);
    });

    // 統計サマリーが表示される
    await waitFor(() => {
      expect(screen.getByText('評価数')).toBeInTheDocument();
    });

    // 精度警告が表示される
    expect(screen.getByText(/推定値/)).toBeInTheDocument();
  });

  it('溶媒スクリーニングモードで分散剤セレクタが表示される', async () => {
    const user = userEvent.setup();
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.getAllDispersants.mockResolvedValue([dispersant]);

    render(<DispersantSelectionView />);

    await user.click(screen.getByText('溶媒スクリーニング'));

    await waitFor(() => {
      expect(screen.getByText('分散剤')).toBeInTheDocument();
    });
  });

  it('簡易評価モードでフォールバック結果が表示される', async () => {
    const user = userEvent.setup();
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.screenDispersantsFallback.mockResolvedValue(buildFallbackResult());

    render(<DispersantSelectionView />);

    await user.click(screen.getByText('簡易評価（全体HSP）'));
    await waitFor(() => expect(screen.getByText(/カーボンブラック/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], String(particle.id));
    await user.click(screen.getByText('スクリーニング実行'));

    await waitFor(() => {
      expect(screen.getByText('簡易評価結果（全体HSPのみ）')).toBeInTheDocument();
      expect(screen.getByText('BYK-163')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'NMP' });
    mockApi.getAllNanoParticles.mockResolvedValue([particle]);
    mockApi.getAllSolvents.mockResolvedValue([solvent]);
    mockApi.screenDispersants.mockRejectedValue(new Error('テストエラー'));

    render(<DispersantSelectionView />);

    await waitFor(() => expect(screen.getByText(/カーボンブラック/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], String(particle.id));
    await user.selectOptions(selects[2], String(solvent.id));
    await user.click(screen.getByText('スクリーニング実行'));

    await waitFor(() => {
      expect(screen.getByText('テストエラー')).toBeInTheDocument();
    });
  });
});
