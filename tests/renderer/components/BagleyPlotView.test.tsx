// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import BagleyPlotView from '../../../src/renderer/components/BagleyPlotView';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('BagleyPlotView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getBagleyPlotData.mockResolvedValue({
      solvents: { names: [], deltaV: [], deltaH: [] },
      parts: { names: [], deltaV: [], deltaH: [] },
    });

    render(<BagleyPlotView />);

    expect(screen.getByText(/Bagleyプロット/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getBagleyPlotData).toHaveBeenCalled());
  });

  it('データ読み込み後にSVGが表示される', async () => {
    mockApi.getBagleyPlotData.mockResolvedValue({
      solvents: { names: ['トルエン'], deltaV: [18.05], deltaH: [2.0] },
      parts: { names: [], deltaV: [], deltaH: [] },
    });

    render(<BagleyPlotView />);

    await waitFor(() => {
      expect(screen.queryByText('データを読み込み中...')).not.toBeInTheDocument();
    });
  });
});
