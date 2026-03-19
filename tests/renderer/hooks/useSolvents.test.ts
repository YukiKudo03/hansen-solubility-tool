// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSolvents } from '../../../src/renderer/hooks/useSolvents';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useSolvents', () => {
  it('初期ロードでsearchSolventsを空文字で呼ぶ', async () => {
    const solvents = [buildSolvent()];
    mockApi.searchSolvents.mockResolvedValue(solvents);

    const { result } = renderHook(() => useSolvents());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.solvents).toEqual(solvents);
    expect(mockApi.searchSolvents).toHaveBeenCalledWith('');
  });

  it('searchQuery変更で再検索', async () => {
    mockApi.searchSolvents.mockResolvedValue([]);

    const { result, rerender } = renderHook(
      ({ query }) => useSolvents(query),
      { initialProps: { query: '' } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    const solvents = [buildSolvent({ name: 'トルエン' })];
    mockApi.searchSolvents.mockResolvedValue(solvents);

    rerender({ query: 'トル' });

    await waitFor(() => {
      expect(result.current.solvents).toEqual(solvents);
    });
    expect(mockApi.searchSolvents).toHaveBeenCalledWith('トル');
  });

  it('API失敗時にerror', async () => {
    mockApi.searchSolvents.mockRejectedValue(new Error('検索エラー'));

    const { result } = renderHook(() => useSolvents());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('検索エラー');
  });

  it('reload()で再取得', async () => {
    mockApi.searchSolvents.mockResolvedValue([]);
    const { result } = renderHook(() => useSolvents());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const solvents = [buildSolvent()];
    mockApi.searchSolvents.mockResolvedValue(solvents);
    await act(async () => { await result.current.reload(); });

    await waitFor(() => expect(result.current.solvents).toEqual(solvents));
  });
});
