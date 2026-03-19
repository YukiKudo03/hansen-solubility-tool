// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SolventSelector from '../../../src/renderer/components/SolventSelector';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('SolventSelector', () => {
  it('検索入力でsearchSolventsが呼ばれドロップダウンを表示', async () => {
    const user = userEvent.setup();
    const solvents = [buildSolvent({ name: 'トルエン', nameEn: 'Toluene', casNumber: '108-88-3' })];
    mockApi.searchSolvents.mockResolvedValue(solvents);

    render(<SolventSelector onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await user.type(input, 'トル');

    await waitFor(() => {
      expect(screen.getByText('トルエン')).toBeInTheDocument();
      expect(screen.getByText(/Toluene/)).toBeInTheDocument();
    });
  });

  it('溶媒クリックでonSelectが呼ばれる', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'アセトン' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    const onSelect = vi.fn();

    render(<SolventSelector onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);

    await waitFor(() => expect(screen.getByText('アセトン')).toBeInTheDocument());
    await user.click(screen.getByText('アセトン'));

    expect(onSelect).toHaveBeenCalledWith(solvent);
  });

  it('selected渡し時に選択済み表示', async () => {
    const solvent = buildSolvent({ name: 'メタノール', nameEn: 'Methanol' });

    render(<SolventSelector onSelect={vi.fn()} selected={solvent} />);

    expect(screen.getByText('メタノール')).toBeInTheDocument();
    expect(screen.getByText('(Methanol)')).toBeInTheDocument();
    expect(screen.getByText('変更')).toBeInTheDocument();
    await waitFor(() => expect(mockApi.searchSolvents).toHaveBeenCalled());
  });

  it('「変更」ボタンでonSelectがnull的値で呼ばれる', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'テスト' });
    const onSelect = vi.fn();

    render(<SolventSelector onSelect={onSelect} selected={solvent} />);

    await user.click(screen.getByText('変更'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('検索結果0件でリストが表示されない', async () => {
    const user = userEvent.setup();
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<SolventSelector onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await user.type(input, 'xyz');

    await waitFor(() => {
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
  });

  it('HSP値がドロップダウンに表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } });
    mockApi.searchSolvents.mockResolvedValue([solvent]);

    render(<SolventSelector onSelect={vi.fn()} />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText(/δD=18/)).toBeInTheDocument();
    });
  });
});
