// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AdhesionView from '../../../src/renderer/components/AdhesionView';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, resetIdCounter } from '../factories';
import { AdhesionLevel } from '../../../src/core/adhesion';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

function buildAdhesionResult(group: ReturnType<typeof buildPartsGroup>, solvent: ReturnType<typeof buildSolvent>) {
  return {
    partsGroup: group,
    solvent,
    results: group.parts.map((part) => ({
      part,
      solvent,
      ra: 1.5,
      adhesionLevel: AdhesionLevel.Excellent,
    })),
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    thresholdsUsed: { excellentMax: 2.0, goodMax: 4.0, fairMax: 6.0, poorMax: 8.0 },
  };
}

describe('AdhesionView', () => {
  it('タイトルが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<AdhesionView />);

    expect(screen.getByText('接着性予測')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('評価ボタンが表示される', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<AdhesionView />);

    expect(screen.getByText('接着性評価')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
  });

  it('評価実行後に結果テーブルが表示される', async () => {
    const user = userEvent.setup();
    const group = buildPartsGroup({ name: '接着テストグループ' });
    const solvent = buildSolvent({ name: 'エポキシ溶媒' });
    mockApi.getAllGroups.mockResolvedValue([group]);
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.evaluateAdhesion.mockResolvedValue(buildAdhesionResult(group, solvent));

    render(<AdhesionView />);

    await waitFor(() => expect(screen.getByText(/接着テストグループ/)).toBeInTheDocument());
    await user.selectOptions(screen.getByRole('combobox'), String(group.id));

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('エポキシ溶媒')).toBeInTheDocument());
    await user.click(screen.getByText('エポキシ溶媒'));

    await user.click(screen.getByText('接着性評価'));

    await waitFor(() => {
      expect(screen.getByText(/評価結果/)).toBeInTheDocument();
    });
  });
});
