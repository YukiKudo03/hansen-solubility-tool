// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import BottomNavigation from '../../src/renderer/components/BottomNavigation';

describe('BottomNavigation', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('5カテゴリが下部に表示される', () => {
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    expect(screen.getByText('評価')).toBeInTheDocument();
    expect(screen.getByText('選定')).toBeInTheDocument();
    expect(screen.getByText('最適化')).toBeInTheDocument();
    expect(screen.getByText('データ')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('アクティブカテゴリにMD3インジケータが表示される', () => {
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    const activeCategory = screen.getByText('📊').closest('button');
    expect(activeCategory?.innerHTML).toContain('bg-md3-secondary-container');
  });

  it('カテゴリタップでポップアップメニューが表示される', async () => {
    const user = userEvent.setup();
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('評価'));
    expect(screen.getByText('溶解性評価')).toBeInTheDocument();
    expect(screen.getByText('膨潤度予測')).toBeInTheDocument();
  });

  it('サブ項目タップでonSelectが呼ばれる', async () => {
    const user = userEvent.setup();
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    await user.click(screen.getByText('評価'));
    await user.click(screen.getByText('膨潤度予測'));
    expect(onSelect).toHaveBeenCalledWith('swelling');
  });

  it('data-testid="bottom-navigation"が設定される', () => {
    render(<BottomNavigation activeTab="report" onSelect={onSelect} />);
    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });
});
