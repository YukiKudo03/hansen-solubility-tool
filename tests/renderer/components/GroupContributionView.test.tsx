// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import GroupContributionView from '../../../src/renderer/components/GroupContributionView';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

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
      firstOrder: [{ id: 'CH3', name: 'メチル基' }, { id: 'CH2', name: 'メチレン基' }],
      secondOrder: [{ id: 'alcohol', name: 'アルコール補正' }],
    });

    render(<GroupContributionView />);

    await waitFor(() => {
      expect(screen.getByText('メチル基')).toBeInTheDocument();
      expect(screen.getByText('メチレン基')).toBeInTheDocument();
    });
  });

  it('推定結果が hsp.deltaD 形式で表示される', async () => {
    mockApi.getGroupContributionGroups.mockResolvedValue({
      firstOrder: [{ id: 'CH3', name: 'メチル基' }],
      secondOrder: [],
    });
    mockApi.estimateGroupContribution.mockResolvedValue({
      hsp: { deltaD: 16.35, deltaP: 2.18, deltaH: 5.07 },
      method: 'stefanis-panayiotou',
      confidence: 'medium',
      warnings: [],
    });

    render(<GroupContributionView />);

    await waitFor(() => expect(mockApi.getGroupContributionGroups).toHaveBeenCalled());
  });
});
