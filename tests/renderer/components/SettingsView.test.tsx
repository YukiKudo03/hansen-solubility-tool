// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SettingsView from '../../../src/renderer/components/SettingsView';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

import { afterEach } from 'vitest';
afterEach(() => {
  vi.useRealTimers();
});

describe('SettingsView', () => {
  it('マウント時にgetThresholdsで閾値を取得し表示', async () => {
    mockApi.getThresholds.mockResolvedValue({
      dangerousMax: 0.5, warningMax: 0.8, cautionMax: 1.2, holdMax: 2.0,
    });

    render(<SettingsView />);

    await waitFor(() => {
      expect(mockApi.getThresholds).toHaveBeenCalled();
    });
  });

  it('「保存」でsetThresholdsが呼ばれる', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<SettingsView />);

    await waitFor(() => expect(mockApi.getThresholds).toHaveBeenCalled());

    await user.click(screen.getByText('保存'));

    expect(mockApi.setThresholds).toHaveBeenCalled();
  });

  it('保存後「保存しました」メッセージが表示される', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<SettingsView />);

    await waitFor(() => expect(mockApi.getThresholds).toHaveBeenCalled());

    await user.click(screen.getByText('保存'));

    expect(screen.getByText('保存しました')).toBeInTheDocument();
  });

  it('「デフォルトに戻す」でデフォルト値にリセット', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockApi.getThresholds.mockResolvedValue({
      dangerousMax: 0.3, warningMax: 0.6, cautionMax: 1.0, holdMax: 1.5,
    });

    render(<SettingsView />);

    await waitFor(() => expect(mockApi.getThresholds).toHaveBeenCalled());

    await user.click(screen.getByText('デフォルトに戻す'));

    // デフォルト値が入力フィールドに反映される
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0.5);
    expect(inputs[1]).toHaveValue(0.8);
    expect(inputs[2]).toHaveValue(1.2);
    expect(inputs[3]).toHaveValue(2.0);
  });

  it('ページにリスク判定の説明テキストが表示される', async () => {
    render(<SettingsView />);

    await waitFor(() => expect(mockApi.getThresholds).toHaveBeenCalled());

    expect(screen.getByText(/リスク判定閾値設定/)).toBeInTheDocument();
    expect(screen.getByText(/RED値/)).toBeInTheDocument();
  });

  it('判定基準の図解が表示される', async () => {
    render(<SettingsView />);

    await waitFor(() => expect(mockApi.getThresholds).toHaveBeenCalled());

    expect(screen.getByText('判定基準の図解')).toBeInTheDocument();
    expect(screen.getByText('危険')).toBeInTheDocument();
    expect(screen.getByText('安全')).toBeInTheDocument();
  });
});
