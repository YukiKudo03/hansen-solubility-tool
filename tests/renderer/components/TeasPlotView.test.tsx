// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import TeasPlotView from '../../../src/renderer/components/TeasPlotView';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('TeasPlotView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getTeasPlotData.mockResolvedValue({
      solvents: { names: [], fd: [], fp: [], fh: [], x: [], y: [] },
      parts: { names: [], fd: [], fp: [], fh: [], x: [], y: [] },
    });

    render(<TeasPlotView />);

    expect(screen.getByText(/Teasプロット/)).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getTeasPlotData).toHaveBeenCalled());
  });

  it('データ読み込み後にSVGが表示される', async () => {
    mockApi.getTeasPlotData.mockResolvedValue({
      solvents: { names: ['エタノール'], fd: [0.39], fp: [0.22], fh: [0.39], x: [0.41], y: [0.34] },
      parts: { names: [], fd: [], fp: [], fh: [], x: [], y: [] },
    });

    render(<TeasPlotView />);

    await waitFor(() => {
      expect(screen.queryByText('データを読み込み中...')).not.toBeInTheDocument();
    });
  });
});
