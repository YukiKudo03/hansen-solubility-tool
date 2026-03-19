// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DrugSolubilityView from '../../../src/renderer/components/DrugSolubilityView';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

const drug = {
  id: 1,
  name: 'アスピリン',
  nameEn: 'Aspirin',
  casNumber: '50-78-2',
  hsp: { deltaD: 17.6, deltaP: 5.1, deltaH: 9.0 },
  r0: 5.0,
  molWeight: 180.16,
  logP: 1.2,
  therapeuticCategory: '鎮痛薬',
  notes: null,
};

describe('DrugSolubilityView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getAllDrugs.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<DrugSolubilityView />);

    expect(screen.getByRole('heading', { name: '薬物溶解性評価' })).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllDrugs).toHaveBeenCalled());
  });

  it('モード切替ボタンが表示される', async () => {
    mockApi.getAllDrugs.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<DrugSolubilityView />);

    expect(screen.getByText('個別評価')).toBeInTheDocument();
    expect(screen.getByText('全溶媒スクリーニング')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllDrugs).toHaveBeenCalled());
  });

  it('スクリーニングモードで評価実行後に結果が表示される', async () => {
    const user = userEvent.setup();
    mockApi.getAllDrugs.mockResolvedValue([drug]);
    mockApi.searchSolvents.mockResolvedValue([]);

    const screenResult = {
      drug,
      results: [
        { drug, solvent: buildSolvent({ name: 'エタノール' }), ra: 2.0, red: 0.4, solubility: 1 },
        { drug, solvent: buildSolvent({ name: 'アセトン' }), ra: 4.5, red: 0.9, solubility: 2 },
      ],
      evaluatedAt: new Date('2026-03-15'),
      thresholdsUsed: { excellentMax: 0.5, goodMax: 1.0, partialMax: 2.0, poorMax: 4.0 },
    };
    mockApi.screenDrugSolvents.mockResolvedValue(screenResult);

    render(<DrugSolubilityView />);

    // スクリーニングモードに切替（モードボタンは最初の「全溶媒スクリーニング」テキスト）
    const modeButtons = screen.getAllByText('全溶媒スクリーニング');
    await user.click(modeButtons[0]);

    // 薬物選択
    await waitFor(() => expect(screen.getByText(/アスピリン/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], String(drug.id));

    // 評価実行（スクリーニングモードのボタンも「全溶媒スクリーニング」）
    // 2つ目の「全溶媒スクリーニング」テキストがアクションボタン
    const actionButtons = screen.getAllByText('全溶媒スクリーニング');
    await user.click(actionButtons[actionButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/最適溶媒/)).toBeInTheDocument();
      expect(screen.getAllByText('エタノール').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('アセトン').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('CSV出力ボタンが結果表示後に出現', async () => {
    const user = userEvent.setup();
    mockApi.getAllDrugs.mockResolvedValue([drug]);
    mockApi.searchSolvents.mockResolvedValue([]);
    mockApi.screenDrugSolvents.mockResolvedValue({
      drug,
      results: [{ drug, solvent: buildSolvent(), ra: 1.0, red: 0.3, solubility: 1 }],
      evaluatedAt: new Date(),
      thresholdsUsed: { excellentMax: 0.5, goodMax: 1.0, partialMax: 2.0, poorMax: 4.0 },
    });

    render(<DrugSolubilityView />);

    expect(screen.queryByText('CSV出力')).not.toBeInTheDocument();

    // スクリーニングモードに切替
    const modeButtons = screen.getAllByText('全溶媒スクリーニング');
    await user.click(modeButtons[0]);

    await waitFor(() => expect(screen.getByText(/アスピリン/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], String(drug.id));

    const actionButtons = screen.getAllByText('全溶媒スクリーニング');
    await user.click(actionButtons[actionButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージ表示', async () => {
    const user = userEvent.setup();
    mockApi.getAllDrugs.mockResolvedValue([drug]);
    mockApi.searchSolvents.mockResolvedValue([]);
    mockApi.screenDrugSolvents.mockRejectedValue(new Error('溶解性エラー'));

    render(<DrugSolubilityView />);

    const modeButtons = screen.getAllByText('全溶媒スクリーニング');
    await user.click(modeButtons[0]);

    await waitFor(() => expect(screen.getByText(/アスピリン/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], String(drug.id));

    const actionButtons = screen.getAllByText('全溶媒スクリーニング');
    await user.click(actionButtons[actionButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('溶解性エラー')).toBeInTheDocument();
    });
  });
});
