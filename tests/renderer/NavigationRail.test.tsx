// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import NavigationRail from '../../src/renderer/components/NavigationRail';

describe('NavigationRail', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('5カテゴリアイコンが表示される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('💾')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });

  it('カテゴリラベルが表示される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('選定')).toBeInTheDocument();
  });

  it('アクティブカテゴリにMD3インジケータが表示される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    const activeCategory = screen.getByText('📊').closest('button');
    expect(activeCategory?.innerHTML).toContain('bg-md3-secondary-container');
  });

  it('カテゴリクリックでポップオーバーが表示されサブ項目が見える', async () => {
    const user = userEvent.setup();
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('📊'));
    expect(screen.getByText('溶解性評価')).toBeInTheDocument();
    expect(screen.getByText('接触角推定')).toBeInTheDocument();
  });

  it('サブ項目クリックでonSelectが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('📊'));
    await user.click(screen.getByText('接触角推定'));
    expect(onSelect).toHaveBeenCalledWith('contactAngle');
  });

  it('data-testid="navigation-rail"が設定される', () => {
    render(<NavigationRail activeTab="report" onSelect={onSelect} />);
    expect(screen.getByTestId('navigation-rail')).toBeInTheDocument();
  });
});
