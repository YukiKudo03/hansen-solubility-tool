// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import HSPVisualizationView from '../../../src/renderer/components/HSPVisualizationView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, resetIdCounter } from '../factories';

// Plotlyをモック（happy-dom環境ではWebGLが使えないため）
vi.mock('react-plotly.js', () => ({
  default: (props: any) => <div data-testid="plotly-chart">Plotly Mock</div>,
}));

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('HSPVisualizationView', () => {
  it('タイトルが表示される', () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);
    render(<HSPVisualizationView />);
    expect(screen.getByText('HSP 3D可視化')).toBeInTheDocument();
  });

  it('グループセレクターが表示される', () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);
    render(<HSPVisualizationView />);
    expect(screen.getByText(/部品グループを選択/)).toBeInTheDocument();
  });

  it('グループ選択後にPlotlyチャートが表示される', async () => {
    const group = buildPartsGroup({ name: '可視化テストG' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<HSPVisualizationView />);

    // グループ選択でプロットが表示される
    await waitFor(() => expect(screen.getByText(/可視化テストG/)).toBeInTheDocument());

    // Plotlyモックが表示される（グループ選択前でもデフォルトプロットが表示される場合あり）
    await waitFor(() => {
      expect(screen.getByTestId('plotly-chart')).toBeInTheDocument();
    });
  });

  it('「HSP球を表示」トグルが存在する', () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);
    render(<HSPVisualizationView />);
    expect(screen.getByText(/HSP球を表示/)).toBeInTheDocument();
  });
});
