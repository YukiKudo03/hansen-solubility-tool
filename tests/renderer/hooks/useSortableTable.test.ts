// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSortableTable } from '../../../src/renderer/hooks/useSortableTable';

describe('useSortableTable', () => {
  it('初期状態: defaultKeyとdefaultDirが反映される', () => {
    const { result } = renderHook(() => useSortableTable('name'));

    expect(result.current.sortKey).toBe('name');
    expect(result.current.sortDir).toBe('asc');
  });

  it('defaultDir指定時にその方向が初期値になる', () => {
    const { result } = renderHook(() => useSortableTable('score', 'desc'));

    expect(result.current.sortKey).toBe('score');
    expect(result.current.sortDir).toBe('desc');
  });

  it('toggleSort: 同じキーで方向が反転する (asc→desc)', () => {
    const { result } = renderHook(() => useSortableTable('name'));

    act(() => { result.current.toggleSort('name'); });

    expect(result.current.sortKey).toBe('name');
    expect(result.current.sortDir).toBe('desc');
  });

  it('toggleSort: 同じキーで方向が反転する (desc→asc)', () => {
    const { result } = renderHook(() => useSortableTable('name'));

    // asc → desc
    act(() => { result.current.toggleSort('name'); });
    expect(result.current.sortDir).toBe('desc');

    // desc → asc
    act(() => { result.current.toggleSort('name'); });
    expect(result.current.sortDir).toBe('asc');
  });

  it('toggleSort: 異なるキーでキーが変更されascにリセット', () => {
    const { result } = renderHook(() => useSortableTable('name'));

    // name desc にしておく
    act(() => { result.current.toggleSort('name'); });
    expect(result.current.sortDir).toBe('desc');

    // score に切り替え → asc にリセット
    act(() => { result.current.toggleSort('score'); });

    expect(result.current.sortKey).toBe('score');
    expect(result.current.sortDir).toBe('asc');
  });
});
