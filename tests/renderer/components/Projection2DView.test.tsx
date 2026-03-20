// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Projection2DView from '../../../src/renderer/components/Projection2DView';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

function makeEmptyProjection(plane: string, xLabel: string, yLabel: string) {
  return {
    plane,
    xLabel,
    yLabel,
    solvents: { names: [], x: [], y: [] },
    parts: { names: [], x: [], y: [], r0: [] },
  };
}

describe('Projection2DView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getProjection2DData.mockResolvedValue({
      projections: [
        makeEmptyProjection('dD-dP', 'δD', 'δP'),
        makeEmptyProjection('dP-dH', 'δP', 'δH'),
        makeEmptyProjection('dD-dH', 'δD', 'δH'),
      ],
    });

    render(<Projection2DView />);

    expect(screen.getByText(/2D射影/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getProjection2DData).toHaveBeenCalled());
  });

  it('データ読み込み後に3つのチャートが表示される', async () => {
    mockApi.getProjection2DData.mockResolvedValue({
      projections: [
        makeEmptyProjection('dD-dP', 'δD', 'δP'),
        makeEmptyProjection('dP-dH', 'δP', 'δH'),
        makeEmptyProjection('dD-dH', 'δD', 'δH'),
      ],
    });

    render(<Projection2DView />);

    await waitFor(() => {
      expect(screen.queryByText('データを読み込み中...')).not.toBeInTheDocument();
    });
  });
});
