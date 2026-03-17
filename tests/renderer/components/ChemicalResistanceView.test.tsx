// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ChemicalResistanceView from '../../../src/renderer/components/ChemicalResistanceView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, buildPart, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

function buildChemicalResistanceResult(group: ReturnType<typeof buildPartsGroup>, solvent: ReturnType<typeof buildSolvent>) {
  return {
    partsGroup: group,
    solvent,
    results: group.parts.map((part) => ({
      part,
      solvent,
      ra: 5.2,
      red: 1.5,
      resistanceLevel: 3,
    })),
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    thresholdsUsed: { excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 },
  };
}

describe('ChemicalResistanceView', () => {
  it('タイトルとセレクターが表示される', () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<ChemicalResistanceView />);

    expect(screen.getByText('耐薬品性予測')).toBeInTheDocument();
    expect(screen.getByText(/部品グループを選択/)).toBeInTheDocument();
    expect(screen.getByText(/溶媒を選択/)).toBeInTheDocument();
  });

  it('評価ボタンが表示される', () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<ChemicalResistanceView />);

    expect(screen.getByText('耐薬品性評価')).toBeInTheDocument();
  });

  it('評価実行後に結果テーブルが表示される', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: '耐薬テストグループ' });
    const solvent = buildSolvent({ name: 'アセトン' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluateChemicalResistance.mockResolvedValue(
      buildChemicalResistanceResult(group, solvent),
    );

    render(<ChemicalResistanceView />);

    // グループ選択
    await waitFor(() => expect(screen.getByText(/耐薬テストグループ/)).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    // 溶媒選択
    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('アセトン')).toBeInTheDocument());
    await user.click(screen.getByText('アセトン'));

    // 評価実行
    await user.click(screen.getByText('耐薬品性評価'));

    await waitFor(() => {
      expect(screen.getByText(/評価結果/)).toBeInTheDocument();
    });
  });

  it('評価エラー時にエラーメッセージ表示', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: 'エラーグループ' });
    const solvent = buildSolvent({ name: 'エラー溶媒' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluateChemicalResistance.mockRejectedValue(new Error('耐薬品性エラー'));

    render(<ChemicalResistanceView />);

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('エラー溶媒')).toBeInTheDocument());
    await user.click(screen.getByText('エラー溶媒'));

    await user.click(screen.getByText('耐薬品性評価'));

    await waitFor(() => {
      expect(screen.getByText('耐薬品性エラー')).toBeInTheDocument();
    });
  });

  it('CSV出力ボタンが結果表示後に出現', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup();
    const solvent = buildSolvent();
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluateChemicalResistance.mockResolvedValue(
      buildChemicalResistanceResult(group, solvent),
    );

    render(<ChemicalResistanceView />);

    expect(screen.queryByText('CSV出力')).not.toBeInTheDocument();

    await waitFor(() => {
      const combobox = screen.getByRole('combobox');
      expect(combobox.querySelectorAll('option').length).toBeGreaterThan(1);
    });
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));
    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getAllByText(solvent.name).length).toBeGreaterThan(0));
    await user.click(screen.getAllByText(solvent.name)[0]);
    await user.click(screen.getByText('耐薬品性評価'));

    await waitFor(() => {
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });
  });
});
