// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCsvExport } from '../../../src/renderer/hooks/useCsvExport';
import { setupMockApi } from '../setup';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  mockApi = setupMockApi();
});

describe('useCsvExport', () => {
  const formatFn = (data: string[]) => data.join(',');

  it('exportCsv成功時にsaveCsvが呼ばれる', async () => {
    mockApi.saveCsv.mockResolvedValue({ saved: true });
    const { result } = renderHook(() => useCsvExport(formatFn));

    await act(async () => {
      await result.current.exportCsv(['a', 'b', 'c']);
    });

    expect(mockApi.saveCsv).toHaveBeenCalledWith('a,b,c');
    expect(result.current.csvError).toBeNull();
  });

  it('result=null時にsaveCsvは呼ばれない（早期return）', async () => {
    const { result } = renderHook(() => useCsvExport(formatFn));

    await act(async () => {
      await result.current.exportCsv(null);
    });

    expect(mockApi.saveCsv).not.toHaveBeenCalled();
    expect(result.current.csvError).toBeNull();
  });

  it('saveCsv例外時にエラーメッセージが設定される', async () => {
    mockApi.saveCsv.mockRejectedValue(new Error('ファイル保存失敗'));
    const { result } = renderHook(() => useCsvExport(formatFn));

    await act(async () => {
      await result.current.exportCsv(['a']);
    });

    expect(result.current.csvError).toBe('ファイル保存失敗');
  });

  it('Error以外の例外でデフォルトメッセージが設定される', async () => {
    mockApi.saveCsv.mockRejectedValue('unknown error');
    const { result } = renderHook(() => useCsvExport(formatFn));

    await act(async () => {
      await result.current.exportCsv(['a']);
    });

    expect(result.current.csvError).toBe('CSV保存中にエラーが発生しました');
  });

  it('再度exportCsv成功時にエラーがクリアされる', async () => {
    mockApi.saveCsv.mockRejectedValueOnce(new Error('一時エラー'));
    const { result } = renderHook(() => useCsvExport(formatFn));

    await act(async () => {
      await result.current.exportCsv(['a']);
    });
    expect(result.current.csvError).toBe('一時エラー');

    mockApi.saveCsv.mockResolvedValue({ saved: true });
    await act(async () => {
      await result.current.exportCsv(['b']);
    });
    expect(result.current.csvError).toBeNull();
  });
});
