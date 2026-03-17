// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNanoParticles } from '../../../src/renderer/hooks/useNanoParticles';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useNanoParticles', () => {
  it('初期ロードでgetAllNanoParticlesを呼びparticlesに格納', async () => {
    const particles = [{ id: 1, name: 'CNT' }, { id: 2, name: 'Graphene' }];
    mockApi.getAllNanoParticles.mockResolvedValue(particles);

    const { result } = renderHook(() => useNanoParticles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.particles).toEqual(particles);
    expect(result.current.error).toBeNull();
    expect(mockApi.getAllNanoParticles).toHaveBeenCalledOnce();
  });

  it('ロード中はloading=true', () => {
    mockApi.getAllNanoParticles.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useNanoParticles());
    expect(result.current.loading).toBe(true);
  });

  it('category指定でgetNanoParticlesByCategoryを呼ぶ', async () => {
    const particles = [{ id: 1, name: 'CNT' }];
    mockApi.getNanoParticlesByCategory.mockResolvedValue(particles);

    const { result } = renderHook(() => useNanoParticles('carbon_nanotube' as any));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.particles).toEqual(particles);
    expect(mockApi.getNanoParticlesByCategory).toHaveBeenCalledWith('carbon_nanotube');
  });

  it('API失敗時にerrorにメッセージ', async () => {
    mockApi.getAllNanoParticles.mockRejectedValue(new Error('読み込み失敗'));

    const { result } = renderHook(() => useNanoParticles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('読み込み失敗');
    expect(result.current.particles).toEqual([]);
  });

  it('API失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.getAllNanoParticles.mockRejectedValue('unknown');

    const { result } = renderHook(() => useNanoParticles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBe('ナノ粒子の読み込みに失敗しました');
  });

  it('reload()で再取得', async () => {
    mockApi.getAllNanoParticles.mockResolvedValue([]);
    const { result } = renderHook(() => useNanoParticles());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const particles = [{ id: 1, name: 'Graphene' }];
    mockApi.getAllNanoParticles.mockResolvedValue(particles);
    await result.current.reload();

    await waitFor(() => {
      expect(result.current.particles).toEqual(particles);
    });
    expect(mockApi.getAllNanoParticles).toHaveBeenCalledTimes(2);
  });

  it('category変更で再ロード', async () => {
    mockApi.getAllNanoParticles.mockResolvedValue([]);
    mockApi.getNanoParticlesByCategory.mockResolvedValue([{ id: 1, name: 'Ag NP' }]);

    const { result, rerender } = renderHook(
      ({ category }) => useNanoParticles(category),
      { initialProps: { category: undefined as any } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockApi.getAllNanoParticles).toHaveBeenCalledOnce();

    rerender({ category: 'metal' as any });

    await waitFor(() => {
      expect(result.current.particles).toEqual([{ id: 1, name: 'Ag NP' }]);
    });
    expect(mockApi.getNanoParticlesByCategory).toHaveBeenCalledWith('metal');
  });
});
