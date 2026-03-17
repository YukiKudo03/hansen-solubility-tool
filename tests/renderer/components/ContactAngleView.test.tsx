// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ContactAngleView from '../../../src/renderer/components/ContactAngleView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, buildPart, resetIdCounter } from '../factories';
import { WettabilityLevel } from '../../../src/core/types';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

function buildContactAngleResult(group: ReturnType<typeof buildPartsGroup>, solvent: ReturnType<typeof buildSolvent>) {
  return {
    partsGroup: group,
    solvent,
    results: group.parts.map((part) => ({
      part,
      solvent,
      contactAngle: 45.2,
      wettability: WettabilityLevel.Wettable,
      surfaceTensionLV: 28.4,
      surfaceEnergySV: 35.0,
      interfacialTension: 3.1,
    })),
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    thresholdsUsed: { superHydrophilicMax: 10, hydrophilicMax: 30, wettableMax: 60, moderateMax: 90, hydrophobicMax: 150 },
  };
}

describe('ContactAngleView', () => {
  it('タイトルとセレクターが表示される', () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<ContactAngleView />);

    expect(screen.getByRole('heading', { name: '接触角推定' })).toBeInTheDocument();
    expect(screen.getByText(/部品グループを選択/)).toBeInTheDocument();
  });

  it('モード切替ボタンが表示される', () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<ContactAngleView />);

    expect(screen.getByText('グループ評価')).toBeInTheDocument();
    expect(screen.getByText('溶媒スクリーニング')).toBeInTheDocument();
  });

  it('グループモードで評価実行後に結果テーブルが表示される', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: '接触角テストG' });
    const solvent = buildSolvent({ name: '水' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.estimateContactAngle.mockResolvedValue(buildContactAngleResult(group, solvent));

    render(<ContactAngleView />);

    // グループ選択
    await waitFor(() => expect(screen.getByText(/接触角テストG/)).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    // 溶媒選択
    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('水')).toBeInTheDocument());
    await user.click(screen.getByText('水'));

    // 評価実行
    await user.click(screen.getByRole('button', { name: '接触角推定' }));

    await waitFor(() => {
      expect(screen.getByText(/最小接触角/)).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージ表示', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: 'エラーG' });
    const solvent = buildSolvent({ name: 'エラー溶媒' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.estimateContactAngle.mockRejectedValue(new Error('推定エラー'));

    render(<ContactAngleView />);

    await waitFor(() => expect(screen.getByText(/エラーG/)).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('エラー溶媒')).toBeInTheDocument());
    await user.click(screen.getByText('エラー溶媒'));

    await user.click(screen.getByRole('button', { name: '接触角推定' }));

    await waitFor(() => {
      expect(screen.getByText('推定エラー')).toBeInTheDocument();
    });
  });

  it('CSV出力ボタンが結果表示後に出現', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup();
    const solvent = buildSolvent();
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.estimateContactAngle.mockResolvedValue(buildContactAngleResult(group, solvent));

    render(<ContactAngleView />);

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
    await user.click(screen.getByRole('button', { name: '接触角推定' }));

    await waitFor(() => {
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });
  });
});
