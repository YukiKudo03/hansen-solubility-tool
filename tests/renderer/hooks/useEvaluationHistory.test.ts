// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEvaluationHistory } from '../../../src/renderer/hooks/useEvaluationHistory';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

const sampleEntry = {
  id: 1,
  pipeline: 'risk',
  params: { partsGroupId: 1, solventId: 2 },
  result: { partsGroup: { name: 'テスト' }, results: [] },
  thresholds: { dangerousMax: 0.5 },
  note: null,
  evaluatedAt: '2026-03-18T10:00:00.000Z',
};

describe('useEvaluationHistory', () => {
  it('初期ロードで全履歴を取得', async () => {
    mockApi.getAllHistory.mockResolvedValue([sampleEntry]);

    const { result } = renderHook(() => useEvaluationHistory());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.entries).toEqual([sampleEntry]);
    expect(mockApi.getAllHistory).toHaveBeenCalledOnce();
  });

  it('ロード中はloading=true', () => {
    mockApi.getAllHistory.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useEvaluationHistory());
    expect(result.current.loading).toBe(true);
  });

  it('API失敗時にerror', async () => {
    mockApi.getAllHistory.mockRejectedValue(new Error('読み込みエラー'));

    const { result } = renderHook(() => useEvaluationHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('読み込みエラー');
  });

  it('パイプラインフィルタで絞り込み', async () => {
    mockApi.getHistoryByPipeline.mockResolvedValue([sampleEntry]);

    const { result } = renderHook(() => useEvaluationHistory('risk'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries).toEqual([sampleEntry]);
    expect(mockApi.getHistoryByPipeline).toHaveBeenCalledWith('risk');
  });

  it('deleteEntryでAPI呼出し後リロード', async () => {
    mockApi.getAllHistory.mockResolvedValue([sampleEntry]);
    mockApi.deleteHistory.mockResolvedValue(true);

    const { result } = renderHook(() => useEvaluationHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteEntry(1);
    });

    expect(mockApi.deleteHistory).toHaveBeenCalledWith(1);
    expect(mockApi.getAllHistory).toHaveBeenCalledTimes(2);
  });
});
