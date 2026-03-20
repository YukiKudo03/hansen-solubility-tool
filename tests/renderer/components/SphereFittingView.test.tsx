// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import SphereFittingView from '../../../src/renderer/components/SphereFittingView';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('SphereFittingView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getAllSolvents.mockResolvedValue([]);

    render(<SphereFittingView />);

    expect(screen.getByText(/HSP球算出/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllSolvents).toHaveBeenCalled());
  });

  it('溶媒リストが表示される', async () => {
    const solvents = [
      buildSolvent({ name: 'トルエン' }),
      buildSolvent({ name: 'エタノール' }),
    ];
    mockApi.getAllSolvents.mockResolvedValue(solvents);

    render(<SphereFittingView />);

    await waitFor(() => {
      expect(screen.getByText('トルエン')).toBeInTheDocument();
      expect(screen.getByText('エタノール')).toBeInTheDocument();
    });
  });

  it('結果が correctCount と totalCount を使って表示される', async () => {
    mockApi.getAllSolvents.mockResolvedValue([]);
    mockApi.fitSphere.mockResolvedValue({
      center: { deltaD: 17.5, deltaP: 3.2, deltaH: 4.1 },
      r0: 6.5,
      fitness: 0.85,
      correctCount: 8,
      totalCount: 10,
      misclassified: [
        { name: '水', isGood: false, ra: 5.0, red: 0.77 },
      ],
    });

    render(<SphereFittingView />);
    await waitFor(() => expect(mockApi.getAllSolvents).toHaveBeenCalled());
  });
});
