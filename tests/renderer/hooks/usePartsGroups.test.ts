// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePartsGroups } from '../../../src/renderer/hooks/usePartsGroups';
import { setupMockApi } from '../setup';
import { buildPartsGroup, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('usePartsGroups', () => {
  it('初期ロードでgetAllGroupsを呼びgroupsに格納', async () => {
    const groups = [buildPartsGroup(), buildPartsGroup()];
    mockApi.getAllGroups.mockResolvedValue(groups);

    const { result } = renderHook(() => usePartsGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.groups).toEqual(groups);
    expect(result.current.error).toBeNull();
    expect(mockApi.getAllGroups).toHaveBeenCalledOnce();
  });

  it('ロード中はloading: true', () => {
    mockApi.getAllGroups.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => usePartsGroups());
    expect(result.current.loading).toBe(true);
  });

  it('API失敗時にerrorにメッセージ', async () => {
    mockApi.getAllGroups.mockRejectedValue(new Error('DB接続エラー'));

    const { result } = renderHook(() => usePartsGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('DB接続エラー');
    expect(result.current.groups).toEqual([]);
  });

  it('reload()で再取得', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);

    const { result } = renderHook(() => usePartsGroups());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const groups = [buildPartsGroup()];
    mockApi.getAllGroups.mockResolvedValue(groups);

    await act(async () => { await result.current.reload(); });

    await waitFor(() => {
      expect(result.current.groups).toEqual(groups);
    });
    expect(mockApi.getAllGroups).toHaveBeenCalledTimes(2);
  });
});
