// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../../src/renderer/App';
import { setupMockApi } from './setup';
import { resetIdCounter } from './factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
  // Default to desktop width for tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query === '(min-width: 840px)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

describe('App', () => {
  it('ヘッダーにアプリタイトル表示', async () => {
    render(<App />);
    expect(screen.getByText('Hansen溶解度パラメータ 溶解性評価ツール')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('ナビゲーションカテゴリが表示される', async () => {
    render(<App />);
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('選定')).toBeInTheDocument();
    expect(screen.getByText('最適化')).toBeInTheDocument();
    expect(screen.getByText('データ')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('初期タブが「溶解性評価」', async () => {
    render(<App />);
    expect(screen.getByText('評価条件')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('MD3 Surface背景色が適用される', async () => {
    const { container } = render(<App />);
    const appRoot = container.firstChild as HTMLElement;
    expect(appRoot.className).toContain('bg-md3-surface');
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('ナビ項目クリックでビューが切り替わる', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 「設定」カテゴリをクリック（展開）
    await user.click(screen.getByText('設定'));
    // 設定カテゴリ内の「設定」サブ項目をクリック
    // Since "設定" category has only one item, look for the sub-item
    const allSettingsButtons = screen.getAllByText('設定');
    // Click the last one (sub-item, not category header)
    await user.click(allSettingsButtons[allSettingsButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('リスク判定閾値設定')).toBeInTheDocument();
    });
  });

  it('NavigationDrawerが表示される（デスクトップ幅）', async () => {
    render(<App />);
    expect(screen.getByTestId('navigation-drawer')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });
});
