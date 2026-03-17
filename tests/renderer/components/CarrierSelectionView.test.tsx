// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CarrierSelectionView from '../../../src/renderer/components/CarrierSelectionView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildPart, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

const drug = {
  id: 1,
  name: 'パクリタキセル',
  nameEn: 'Paclitaxel',
  casNumber: '33069-62-4',
  hsp: { deltaD: 17.8, deltaP: 3.2, deltaH: 8.4 },
  r0: 5.0,
  molWeight: 853.9,
  logP: 3.0,
  therapeuticCategory: '抗がん剤',
  notes: null,
};

describe('CarrierSelectionView', () => {
  it('タイトルが表示される', () => {
    mockApi.getAllDrugs.mockResolvedValue([]);
    mockApi.getAllGroups.mockResolvedValue([]);

    render(<CarrierSelectionView />);

    expect(screen.getByText('キャリア選定（DDS）')).toBeInTheDocument();
  });

  it('モード切替ボタンが表示される', () => {
    mockApi.getAllDrugs.mockResolvedValue([]);
    mockApi.getAllGroups.mockResolvedValue([]);

    render(<CarrierSelectionView />);

    expect(screen.getByText('個別評価')).toBeInTheDocument();
    expect(screen.getByText('グループスクリーニング')).toBeInTheDocument();
  });

  it('スクリーニングモードで評価実行後に結果が表示される', async () => {
    const user = userEvent.setup();
    const carriers = [buildPart({ name: 'PLGA NP' }), buildPart({ name: 'PEG-PLGA NP' })];
    const group = buildPartsGroup({ name: 'キャリアグループ', parts: carriers });
    mockApi.getAllDrugs.mockResolvedValue([drug]);
    mockApi.getAllGroups.mockResolvedValue([group]);

    const screenResult = {
      drug,
      partsGroup: group,
      results: carriers.map((c) => ({
        carrier: c,
        ra: 2.5,
        red: 0.5,
        compatibility: 1,
      })),
      evaluatedAt: new Date('2026-03-15'),
      thresholdsUsed: { excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 },
    };
    mockApi.screenCarriers.mockResolvedValue(screenResult);

    render(<CarrierSelectionView />);

    // スクリーニングモードに切替
    await user.click(screen.getByText('グループスクリーニング'));

    // 薬物選択
    await waitFor(() => expect(screen.getByText(/パクリタキセル/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], String(drug.id));

    // キャリアグループ選択 (PartsGroupSelector)
    await waitFor(() => expect(screen.getByText(/キャリアグループ/)).toBeInTheDocument());
    // PartsGroupSelectorは最初のcomboboxの次にあるはず
    const updatedSelects = screen.getAllByRole('combobox');
    const groupSelect = updatedSelects[1]; // 2番目がPartsGroupSelector
    await user.selectOptions(groupSelect, String(group.id));

    // 評価実行
    await user.click(screen.getByText('スクリーニング実行'));

    await waitFor(() => {
      expect(screen.getByText(/最適キャリア/)).toBeInTheDocument();
    });
  });

  it('エラー時にエラーメッセージ表示', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: 'ErrGroup' });
    mockApi.getAllDrugs.mockResolvedValue([drug]);
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.screenCarriers.mockRejectedValue(new Error('キャリアエラー'));

    render(<CarrierSelectionView />);

    await user.click(screen.getByText('グループスクリーニング'));

    await waitFor(() => expect(screen.getByText(/パクリタキセル/)).toBeInTheDocument());
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], String(drug.id));

    await waitFor(() => expect(screen.getByText(/ErrGroup/)).toBeInTheDocument());
    const updatedSelects = screen.getAllByRole('combobox');
    await user.selectOptions(updatedSelects[1], String(group.id));

    await user.click(screen.getByText('スクリーニング実行'));

    await waitFor(() => {
      expect(screen.getByText('キャリアエラー')).toBeInTheDocument();
    });
  });
});
