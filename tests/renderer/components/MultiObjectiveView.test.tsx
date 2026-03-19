// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import MultiObjectiveView from '../../../src/renderer/components/MultiObjectiveView';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('MultiObjectiveView', () => {
  it('タイトルが表示される', () => {
    render(<MultiObjectiveView />);
    expect(screen.getByText('多目的溶媒選定')).toBeInTheDocument();
  });

  it('スクリーニングボタンが表示される', () => {
    render(<MultiObjectiveView />);
    expect(screen.getByText('スクリーニング実行')).toBeInTheDocument();
  });

  it('結果が scores.hspMatch, scores.overall で表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'テスト溶媒' });
    mockApi.screenMultiObjective.mockResolvedValue({
      results: [
        {
          solvent,
          scores: { hspMatch: 0.9, boilingPoint: 0.7, viscosity: 0.5, surfaceTension: 0.6, safety: 0.8, overall: 0.75 },
          red: 0.3,
          ra: 2.4,
        },
      ],
      weights: { hspMatch: 0.4, boilingPoint: 0.15, viscosity: 0.1, surfaceTension: 0.1, safety: 0.15, cost: 0.1 },
      evaluatedAt: new Date(),
    });

    render(<MultiObjectiveView />);

    // Fill in required fields
    const inputs = screen.getAllByRole('spinbutton');
    await user.type(inputs[0], '18');
    await user.type(inputs[1], '10');
    await user.type(inputs[2], '12');
    await user.type(inputs[3], '8');

    await user.click(screen.getByText('スクリーニング実行'));

    await waitFor(() => {
      expect(screen.getByText(/スクリーニング結果/)).toBeInTheDocument();
    });
  });
});
