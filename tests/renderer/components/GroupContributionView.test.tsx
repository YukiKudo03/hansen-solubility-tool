// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import GroupContributionView from '../../../src/renderer/components/GroupContributionView';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

const firstOrderGroups = [
  { id: 'CH3', name: 'メチル基' },
  { id: 'CH2', name: 'メチレン基' },
];
const secondOrderGroups = [
  { id: 'alcohol', name: 'アルコール補正' },
];

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('GroupContributionView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getGroupContributionGroups.mockResolvedValue({ firstOrder: [], secondOrder: [] });

    render(<GroupContributionView />);

    expect(screen.getByText(/族寄与法によるHSP推定/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getGroupContributionGroups).toHaveBeenCalled());
  });

  it('グループ定義が読み込まれる', async () => {
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: secondOrderGroups,
    });

    render(<GroupContributionView />);

    await waitFor(() => {
      expect(screen.getByText('メチル基')).toBeInTheDocument();
      expect(screen.getByText('メチレン基')).toBeInTheDocument();
    });
  });

  it('+ボタンでグループカウントが増加する', async () => {
    const user = userEvent.setup();
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: [],
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    // メチル基の+ボタンをクリック
    const plusButtons = screen.getAllByText('+');
    await user.click(plusButtons[0]);

    // 選択中のグループサマリーに表示される
    expect(screen.getByText(/メチル基 x1/)).toBeInTheDocument();
  });

  it('-ボタンでグループカウントが減少する', async () => {
    const user = userEvent.setup();
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: [],
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    // 2回+
    const plusButtons = screen.getAllByText('+');
    await user.click(plusButtons[0]);
    await user.click(plusButtons[0]);
    expect(screen.getByText(/メチル基 x2/)).toBeInTheDocument();

    // 1回-
    const minusButtons = screen.getAllByText('-');
    await user.click(minusButtons[0]);
    expect(screen.getByText(/メチル基 x1/)).toBeInTheDocument();
  });

  it('全解除ボタンでカウントがリセットされる', async () => {
    const user = userEvent.setup();
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: [],
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    const plusButtons = screen.getAllByText('+');
    await user.click(plusButtons[0]);
    expect(screen.getByText(/メチル基 x1/)).toBeInTheDocument();

    await user.click(screen.getByText('全解除'));

    // 選択中のグループサマリーが消える
    expect(screen.queryByText(/メチル基 x1/)).not.toBeInTheDocument();
  });

  it('第2次グループのアコーディオンが開閉する', async () => {
    const user = userEvent.setup();
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: secondOrderGroups,
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    // 第2次補正グループはデフォルトで閉じている
    expect(screen.queryByText('アルコール補正')).not.toBeInTheDocument();

    // 開く (ボタンをtype="button"で特定)
    const toggleButton = screen.getByRole('button', { name: /第2次補正グループ/ });
    await user.click(toggleButton);
    expect(screen.getByText('アルコール補正')).toBeInTheDocument();
  });

  it('1次基未選択時はHSP推定ボタンがdisabled', async () => {
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: [],
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    expect(screen.getByText('HSP推定')).toBeDisabled();
  });

  it('推定実行で結果が正しく表示される', async () => {
    const user = userEvent.setup();
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: [],
    });
    mockApi.estimateGroupContribution.mockResolvedValue({
      hsp: { deltaD: 16.35, deltaP: 2.18, deltaH: 5.07 },
      method: 'stefanis-panayiotou',
      confidence: 'high',
      warnings: [],
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    // グループ選択
    const plusButtons = screen.getAllByText('+');
    await user.click(plusButtons[0]);

    // 推定実行
    await user.click(screen.getByText('HSP推定'));

    await waitFor(() => {
      expect(screen.getByText('16.35')).toBeInTheDocument();
      expect(screen.getByText('2.18')).toBeInTheDocument();
      expect(screen.getByText('5.07')).toBeInTheDocument();
      expect(screen.getByText('高')).toBeInTheDocument(); // confidence label
    });
  });

  it('confidence=mediumで「中」が表示される', async () => {
    const user = userEvent.setup();
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: [],
    });
    mockApi.estimateGroupContribution.mockResolvedValue({
      hsp: { deltaD: 16.0, deltaP: 2.0, deltaH: 5.0 },
      method: 'stefanis-panayiotou',
      confidence: 'medium',
      warnings: [],
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    const plusButtons = screen.getAllByText('+');
    await user.click(plusButtons[0]);
    await user.click(screen.getByText('HSP推定'));

    await waitFor(() => {
      expect(screen.getByText('中')).toBeInTheDocument();
    });
  });

  it('warningsが表示される', async () => {
    const user = userEvent.setup();
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: firstOrderGroups,
      secondOrder: [],
    });
    mockApi.estimateGroupContribution.mockResolvedValue({
      hsp: { deltaD: 16.0, deltaP: 2.0, deltaH: 5.0 },
      method: 'stefanis-panayiotou',
      confidence: 'low',
      warnings: ['第2次補正グループが選択されていません', '推定精度が低い可能性があります'],
    });

    render(<GroupContributionView />);
    await waitFor(() => expect(screen.getByText('メチル基')).toBeInTheDocument());

    const plusButtons = screen.getAllByText('+');
    await user.click(plusButtons[0]);
    await user.click(screen.getByText('HSP推定'));

    await waitFor(() => {
      expect(screen.getByText('第2次補正グループが選択されていません')).toBeInTheDocument();
      expect(screen.getByText('推定精度が低い可能性があります')).toBeInTheDocument();
    });
  });

  it('API失敗時にエラーが表示される', async () => {
    mockApi.getGroupContributionGroups.mockRejectedValue(new Error('読み込みエラー'));

    render(<GroupContributionView />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('読み込みエラー')).toBeInTheDocument();
    });
  });
});
