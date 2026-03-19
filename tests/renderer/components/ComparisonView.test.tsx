// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ComparisonView from '../../../src/renderer/components/ComparisonView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('ComparisonView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);
    render(<ComparisonView />);
    expect(screen.getByText('横断比較レポート')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('グループセレクターが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);
    render(<ComparisonView />);
    expect(screen.getByText(/部品グループを選択/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('比較実行ボタンが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);
    render(<ComparisonView />);
    expect(screen.getByText('比較実行')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('グループ選択と溶媒選択後に比較実行できる', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: '比較テストG' });
    const solvent = buildSolvent({ name: 'アセトン' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);

    render(<ComparisonView />);

    // グループ選択
    await waitFor(() => expect(screen.getByText(/比較テストG/)).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    // 溶媒選択
    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('アセトン')).toBeInTheDocument());
    await user.click(screen.getByText('アセトン'));

    // 比較実行
    await user.click(screen.getByText('比較実行'));

    // 結果テーブルが表示される
    await waitFor(() => {
      expect(screen.getByText(/比較結果/)).toBeInTheDocument();
    });
  });
});
