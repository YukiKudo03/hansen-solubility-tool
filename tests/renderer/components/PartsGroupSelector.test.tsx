// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import PartsGroupSelector from '../../../src/renderer/components/PartsGroupSelector';
import { setupMockApi } from '../setup';
import { buildPartsGroup, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('PartsGroupSelector', () => {
  it('マウント時にgetAllGroupsを呼びselect要素にグループ一覧を表示', async () => {
    const groups = [
      buildPartsGroup({ name: 'グループA' }),
      buildPartsGroup({ name: 'グループB' }),
    ];
    mockApi.getAllGroups.mockResolvedValue(groups);

    render(<PartsGroupSelector onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/グループA/)).toBeInTheDocument();
      expect(screen.getByText(/グループB/)).toBeInTheDocument();
    });
  });

  it('option選択でonSelectがグループオブジェクト付きで呼ばれる', async () => {
    const user = userEvent.setup();
    const groups = [buildPartsGroup({ name: 'テストG' })];
    mockApi.getAllGroups.mockResolvedValue(groups);
    const onSelect = vi.fn();

    render(<PartsGroupSelector onSelect={onSelect} />);

    await waitFor(() => expect(screen.getByText(/テストG/)).toBeInTheDocument());

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, String(groups[0].id));

    expect(onSelect).toHaveBeenCalledWith(groups[0]);
  });

  it('selected渡し時に説明と部品一覧を表示', async () => {
    const group = buildPartsGroup({ name: 'マイグループ', description: '説明テキスト' });
    mockApi.getAllGroups.mockResolvedValue([group]);

    render(<PartsGroupSelector onSelect={vi.fn()} selected={group} />);

    await waitFor(() => {
      expect(screen.getByText('説明テキスト')).toBeInTheDocument();
      expect(screen.getByText(/含まれる部品:/)).toBeInTheDocument();
    });
  });

  it('グループ空でもクラッシュしない', async () => {
    mockApi.getAllGroups.mockResolvedValue([]);

    render(<PartsGroupSelector onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('-- 選択してください --')).toBeInTheDocument();
    });
  });
});
