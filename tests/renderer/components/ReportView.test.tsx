// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ReportView from '../../../src/renderer/components/ReportView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, buildGroupEvaluationResult, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('ReportView', () => {
  it('PartsGroupSelectorとSolventSelectorが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<ReportView />);

    expect(screen.getByText('評価条件')).toBeInTheDocument();
    expect(screen.getByText(/部品グループを選択/)).toBeInTheDocument();
    expect(screen.getByText(/溶媒を選択/)).toBeInTheDocument();
  });

  it('「評価実行」ボタンが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<ReportView />);

    expect(screen.getByText('評価実行')).toBeInTheDocument();
  });

  it('評価実行後にResultsTableが表示される', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: '汎用プラスチック' });
    const solvent = buildSolvent({ name: 'トルエン' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);

    const evalResult = buildGroupEvaluationResult({
      partsGroup: group,
      solvent,
    });
    mockApi.evaluate.mockResolvedValue(evalResult);

    render(<ReportView />);

    // グループ選択
    await waitFor(() => expect(screen.getByText(/汎用プラスチック/)).toBeInTheDocument());
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, String(group.id));

    // 溶媒選択
    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('トルエン')).toBeInTheDocument());
    await user.click(screen.getByText('トルエン'));

    // 評価実行
    await user.click(screen.getByText('評価実行'));

    await waitFor(() => {
      expect(screen.getByText(/評価結果/)).toBeInTheDocument();
    });
  });

  it('評価エラー時にエラーメッセージ表示', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: 'エラーテスト用' });
    const solvent = buildSolvent({ name: 'テスト溶媒X' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluate.mockRejectedValue(new Error('評価エラー'));

    render(<ReportView />);

    // グループ選択
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    // 溶媒選択
    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('テスト溶媒X')).toBeInTheDocument());
    await user.click(screen.getByText('テスト溶媒X'));

    // 評価実行 → エラー
    await user.click(screen.getByText('評価実行'));

    await waitFor(() => {
      expect(screen.getByText('評価エラー')).toBeInTheDocument();
    });
  });

  it('CSV出力ボタンが結果表示後に出現', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup();
    const solvent = buildSolvent();
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluate.mockResolvedValue(buildGroupEvaluationResult({ partsGroup: group, solvent }));

    render(<ReportView />);

    // 初期状態ではCSV出力なし
    expect(screen.queryByText('CSV出力')).not.toBeInTheDocument();

    // 選択→評価
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));
    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getAllByText(solvent.name).length).toBeGreaterThan(0));
    await user.click(screen.getAllByText(solvent.name)[0]);
    await user.click(screen.getByText('評価実行'));

    await waitFor(() => {
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });
  });
});
