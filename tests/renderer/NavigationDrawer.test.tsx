// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import NavigationDrawer from '../../src/renderer/components/NavigationDrawer';

describe('NavigationDrawer', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('5カテゴリが表示される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('選定')).toBeInTheDocument();
    expect(screen.getByText('最適化')).toBeInTheDocument();
    expect(screen.getByText('データ')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('アクティブタブのカテゴリが展開されサブ項目が表示される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('溶解性評価')).toBeInTheDocument();
    expect(screen.getByText('接触角推定')).toBeInTheDocument();
    expect(screen.getByText('膨潤度予測')).toBeInTheDocument();
    expect(screen.getByText('耐薬品性予測')).toBeInTheDocument();
  });

  it('アクティブタブにMD3ハイライトが適用される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    const activeItem = screen.getByText('溶解性評価').closest('button');
    expect(activeItem?.className).toContain('bg-md3-secondary-container');
  });

  it('サブ項目クリックでonSelectが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('接触角推定'));
    expect(onSelect).toHaveBeenCalledWith('contactAngle');
  });

  it('カテゴリクリックで展開が切り替わる', async () => {
    const user = userEvent.setup();
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    // 「選定」カテゴリをクリック → サブ項目が表示される
    await user.click(screen.getByText('選定'));
    expect(screen.getByText('ナノ粒子分散')).toBeInTheDocument();
    expect(screen.getByText('可塑剤選定')).toBeInTheDocument();
  });

  it('data-testid="navigation-drawer"が設定される', () => {
    render(<NavigationDrawer activeTab="report" onSelect={onSelect} />);
    expect(screen.getByTestId('navigation-drawer')).toBeInTheDocument();
  });
});
