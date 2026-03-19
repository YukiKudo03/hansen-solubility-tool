// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PlasticizerView from '../../../src/renderer/components/PlasticizerView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, buildPart, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

/** グループセレクターと部品セレクターを取得するヘルパー */
function getSelectors() {
  const selects = screen.getAllByRole('combobox');
  return { groupSelect: selects[0], partSelect: selects[1] };
}

describe('PlasticizerView', () => {
  it('タイトルとセレクターが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);

    render(<PlasticizerView />);

    expect(screen.getByText('可塑剤選定')).toBeInTheDocument();
    expect(screen.getByText(/部品グループを選択/)).toBeInTheDocument();
    expect(screen.getByText(/部品を選択/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('スクリーニング実行ボタンが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);

    render(<PlasticizerView />);

    expect(screen.getByText('スクリーニング実行')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('グループ選択後に部品セレクターに部品が表示される', async () => {
    const user = userEvent.setup();
    const parts = [buildPart({ name: 'PVC管' }), buildPart({ name: 'PVC板' })];
    const group = buildPartsGroup({ name: 'PVCグループ', parts });
    mockApi.getAllGroups.mockResolvedValue([group]);

    render(<PlasticizerView />);

    await waitFor(() => expect(screen.getByText(/PVCグループ/)).toBeInTheDocument());
    const { groupSelect } = getSelectors();
    await user.selectOptions(groupSelect, String(group.id));

    await waitFor(() => {
      // PartsGroupSelectorの説明文とoptionの両方に出るのでgetAllByTextを使う
      expect(screen.getAllByText(/PVC管/).length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText(/PVC板/).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('スクリーニング実行後に結果テーブルが表示される', async () => {
    const user = userEvent.setup();
    const parts = [buildPart({ name: 'PVC管' })];
    const group = buildPartsGroup({ name: 'PVCグループ', parts });
    mockApi.getAllGroups.mockResolvedValue([group]);

    const screenResult = {
      part: parts[0],
      results: [
        { solvent: buildSolvent({ name: 'DOP' }), ra: 2.1, red: 0.4, compatibility: 1 },
        { solvent: buildSolvent({ name: 'DINP' }), ra: 3.5, red: 0.66, compatibility: 2 },
      ],
      evaluatedAt: new Date('2026-03-15'),
      thresholdsUsed: { excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 },
    };
    mockApi.screenPlasticizers.mockResolvedValue(screenResult);

    render(<PlasticizerView />);

    // グループ選択
    await waitFor(() => expect(screen.getByText(/PVCグループ/)).toBeInTheDocument());
    const { groupSelect } = getSelectors();
    await user.selectOptions(groupSelect, String(group.id));

    // 部品選択
    const { partSelect } = getSelectors();
    await user.selectOptions(partSelect, String(parts[0].id));

    // スクリーニング実行
    await user.click(screen.getByText('スクリーニング実行'));

    await waitFor(() => {
      expect(screen.getByText(/スクリーニング結果/)).toBeInTheDocument();
      expect(screen.getByText('DOP')).toBeInTheDocument();
      expect(screen.getByText('DINP')).toBeInTheDocument();
    });
  });

  it('CSV出力ボタンが結果表示後に出現', async () => {
    const user = userEvent.setup();
    const parts = [buildPart({ name: '部品X' })];
    const group = buildPartsGroup({ parts });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.screenPlasticizers.mockResolvedValue({
      part: parts[0],
      results: [{ solvent: buildSolvent(), ra: 1.0, red: 0.3, compatibility: 1 }],
      evaluatedAt: new Date(),
      thresholdsUsed: { excellentMax: 0.5, goodMax: 1.0, fairMax: 2.0, poorMax: 4.0 },
    });

    render(<PlasticizerView />);

    expect(screen.queryByText('CSV出力')).not.toBeInTheDocument();

    await waitFor(() => {
      const { groupSelect } = getSelectors();
      expect(groupSelect.querySelectorAll('option').length).toBeGreaterThan(1);
    });

    const { groupSelect } = getSelectors();
    await user.selectOptions(groupSelect, String(group.id));

    const { partSelect } = getSelectors();
    await user.selectOptions(partSelect, String(parts[0].id));

    await user.click(screen.getByText('スクリーニング実行'));

    await waitFor(() => {
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });
  });
});
