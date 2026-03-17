import { useState, useEffect, useCallback } from 'react';
import type { Bookmark, BookmarkParams } from '../../core/types';
import { serializeBookmarkParams } from '../../core/bookmark';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.api.getAllBookmarks();
      setBookmarks(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ブックマークの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const createBookmark = useCallback(async (
    name: string,
    pipeline: string,
    params: BookmarkParams,
  ) => {
    await window.api.createBookmark({
      name,
      pipeline,
      paramsJson: serializeBookmarkParams(params),
    });
    await reload();
  }, [reload]);

  const deleteBookmark = useCallback(async (id: number) => {
    await window.api.deleteBookmark(id);
    await reload();
  }, [reload]);

  return { bookmarks, loading, error, createBookmark, deleteBookmark, reload };
}
