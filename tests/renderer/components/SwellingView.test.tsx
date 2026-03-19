// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SwellingView from '../../../src/renderer/components/SwellingView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, buildPart, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

function buildSwellingResult(group: ReturnType<typeof buildPartsGroup>, solvent: ReturnType<typeof buildSolvent>) {
  return {
    partsGroup: group,
    solvent,
    results: group.parts.map((part) => ({
      part,
      solvent,
      ra: 3.5,
      red: 0.66,
      swellingLevel: 2,
    })),
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    thresholdsUsed: { minimalMax: 0.5, slightMax: 1.0, moderateMax: 2.0, severeMax: 5.0 },
  };
}

describe('SwellingView', () => {
  it('タイトルとセレクターが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<SwellingView />);

    expect(screen.getByText('膨潤度予測')).toBeInTheDocument();
    expect(screen.getByText(/部品グループを選択/)).toBeInTheDocument();
    expect(screen.getByText(/溶媒を選択/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('評価ボタンが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<SwellingView />);

    expect(screen.getByText('膨潤度評価')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('評価実行後に結果テーブルが表示される', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: 'ゴム部品グループ' });
    const solvent = buildSolvent({ name: 'ヘキサン' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluateSwelling.mockResolvedValue(buildSwellingResult(group, solvent));

    render(<SwellingView />);

    await waitFor(() => expect(screen.getByText(/ゴム部品グループ/)).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('ヘキサン')).toBeInTheDocument());
    await user.click(screen.getByText('ヘキサン'));

    await user.click(screen.getByText('膨潤度評価'));

    await waitFor(() => {
      expect(screen.getByText(/評価結果/)).toBeInTheDocument();
    });
  });

  it('エラストマー以外の材料で警告表示', async () => {
    const user = userEvent.setup();
    const parts = [buildPart({ materialType: 'PS' })];
    const group = buildPartsGroup({ name: 'PSグループ', parts });
    const solvent = buildSolvent({ name: 'トルエン' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluateSwelling.mockResolvedValue(buildSwellingResult(group, solvent));

    render(<SwellingView />);

    await waitFor(() => {
      const combobox = screen.getByRole('combobox');
      expect(combobox.querySelectorAll('option').length).toBeGreaterThan(1);
    });
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('トルエン')).toBeInTheDocument());
    await user.click(screen.getByText('トルエン'));

    await user.click(screen.getByText('膨潤度評価'));

    await waitFor(() => {
      expect(screen.getByText(/エラストマー\/ゴム以外/)).toBeInTheDocument();
    });
  });

  it('CSV出力ボタンが結果表示後に出現', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup();
    const solvent = buildSolvent();
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluateSwelling.mockResolvedValue(buildSwellingResult(group, solvent));

    render(<SwellingView />);

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
    await user.click(screen.getByText('膨潤度評価'));

    await waitFor(() => {
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });
  });
});
