// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBookmarks } from '../../../src/renderer/hooks/useBookmarks';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useBookmarks', () => {
  it('初期ロードでgetAllBookmarksを呼びbookmarksに格納', async () => {
    const bookmarks = [
      { id: 1, name: 'テスト1', pipeline: 'risk', params: { partsGroupId: 1 }, createdAt: new Date() },
    ];
    mockApi.getAllBookmarks.mockResolvedValue(bookmarks);

    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.bookmarks).toEqual(bookmarks);
    expect(mockApi.getAllBookmarks).toHaveBeenCalledOnce();
  });

  it('ロード中はloading=true', () => {
    mockApi.getAllBookmarks.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useBookmarks());
    expect(result.current.loading).toBe(true);
  });

  it('API失敗時にerrorにメッセージ', async () => {
    mockApi.getAllBookmarks.mockRejectedValue(new Error('読み込みエラー'));

    const { result } = renderHook(() => useBookmarks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('読み込みエラー');
  });

  it('createBookmarkでAPI呼出し後リロード', async () => {
    mockApi.getAllBookmarks.mockResolvedValue([]);
    mockApi.createBookmark.mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createBookmark('テスト', 'risk', { partsGroupId: 1 });
    });

    expect(mockApi.createBookmark).toHaveBeenCalledWith({
      name: 'テスト',
      pipeline: 'risk',
      paramsJson: '{"partsGroupId":1}',
    });
    // リロードで再度getAllBookmarksが呼ばれる
    expect(mockApi.getAllBookmarks).toHaveBeenCalledTimes(2);
  });

  it('deleteBookmarkでAPI呼出し後リロード', async () => {
    const bookmarks = [
      { id: 1, name: 'テスト1', pipeline: 'risk', params: { partsGroupId: 1 }, createdAt: new Date() },
    ];
    mockApi.getAllBookmarks.mockResolvedValue(bookmarks);
    mockApi.deleteBookmark.mockResolvedValue(true);

    const { result } = renderHook(() => useBookmarks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteBookmark(1);
    });

    expect(mockApi.deleteBookmark).toHaveBeenCalledWith(1);
    expect(mockApi.getAllBookmarks).toHaveBeenCalledTimes(2);
  });
});
