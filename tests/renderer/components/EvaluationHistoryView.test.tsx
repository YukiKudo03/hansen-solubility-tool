// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import EvaluationHistoryView from '../../../src/renderer/components/EvaluationHistoryView';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

const sampleEntries = [
  { id: 1, pipeline: 'risk', params: {}, result: {}, thresholds: {}, note: null, evaluatedAt: '2026-03-18T10:00:00Z' },
  { id: 2, pipeline: 'contactAngle', params: {}, result: {}, thresholds: {}, note: 'メモ', evaluatedAt: '2026-03-17T09:00:00Z' },
];

describe('EvaluationHistoryView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getAllHistory.mockResolvedValue([]);
    render(<EvaluationHistoryView />);
    expect(screen.getByText('評価履歴')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllHistory).toHaveBeenCalled());
  });

  it('履歴一覧が表示される', async () => {
    mockApi.getAllHistory.mockResolvedValue(sampleEntries);
    render(<EvaluationHistoryView />);

    await waitFor(() => {
      expect(screen.getByText(/溶解性評価/)).toBeInTheDocument();
      expect(screen.getByText(/接触角推定/)).toBeInTheDocument();
    });
  });

  it('履歴が空のとき「履歴がありません」表示', async () => {
    mockApi.getAllHistory.mockResolvedValue([]);
    render(<EvaluationHistoryView />);

    await waitFor(() => {
      expect(screen.getByText(/履歴がありません/)).toBeInTheDocument();
    });
  });

  it('パイプラインフィルタが表示される', async () => {
    mockApi.getAllHistory.mockResolvedValue([]);
    render(<EvaluationHistoryView />);

    expect(screen.getByText('すべて')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllHistory).toHaveBeenCalled());
  });

  it('削除ボタンでdeleteHistoryが呼ばれる', async () => {
    const user = userEvent.setup();
    mockApi.getAllHistory.mockResolvedValue(sampleEntries);
    mockApi.deleteHistory.mockResolvedValue(true);

    render(<EvaluationHistoryView />);

    await waitFor(() => expect(screen.getByText(/溶解性評価/)).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockApi.deleteHistory).toHaveBeenCalledWith(1);
    });
    // deleteEntry内のreload()完了を待つ
    await waitFor(() => expect(mockApi.getAllHistory).toHaveBeenCalledTimes(2));
  });
});
