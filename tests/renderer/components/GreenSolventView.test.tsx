// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import GreenSolventView from '../../../src/renderer/components/GreenSolventView';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('GreenSolventView', () => {
  it('タイトルが表示される', async () => {
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<GreenSolventView />);

    expect(screen.getByText('グリーン溶媒代替提案')).toBeInTheDocument();
    await waitFor(() => {});
  });

  it('検索ボタンが表示される', async () => {
    render(<GreenSolventView />);
    expect(screen.getByText('代替溶媒を検索')).toBeInTheDocument();
    await waitFor(() => {});
  });

  it('検索結果が表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'DCM' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.findGreenAlternatives.mockResolvedValue({
      targetSolvent: solvent,
      candidates: [
        {
          solvent: buildSolvent({ name: '酢酸エチル', casNumber: '141-78-6' }),
          ra: 3.5,
          safetyInfo: { casNumber: '141-78-6', safetyRating: 'recommended', environmentalScore: 8, healthScore: 8, isGreenAlternative: true },
          overallScore: 0.25,
        },
      ],
      evaluatedAt: new Date(),
    });

    render(<GreenSolventView />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('DCM')).toBeInTheDocument());
    await user.click(screen.getByText('DCM'));

    await user.click(screen.getByText('代替溶媒を検索'));

    await waitFor(() => {
      expect(screen.getByText('酢酸エチル')).toBeInTheDocument();
      expect(screen.getByText('推奨')).toBeInTheDocument();
    });
  });
});
