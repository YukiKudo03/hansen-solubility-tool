// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import DatabaseEditor from '../../../src/renderer/components/DatabaseEditor';
import { setupMockApi } from '../setup';
import { buildPartsGroup, buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});

describe('DatabaseEditor', () => {
  describe('タブ切り替え', () => {
    it('「部品グループ」「溶媒」タブが表示される', async () => {
      render(<DatabaseEditor />);
      expect(screen.getByText('部品グループ')).toBeInTheDocument();
      expect(screen.getByText('溶媒')).toBeInTheDocument();
      await waitFor(() => expect(mockApi.getAllGroups).toHaveBeenCalled());
    });

    it('「溶媒」タブクリックで溶媒テーブルが表示される', async () => {
      const user = userEvent.setup();
      const solvent = buildSolvent({ name: 'テスト溶媒' });
      mockApi.searchSolvents.mockResolvedValue([solvent]);

      render(<DatabaseEditor />);

      await user.click(screen.getByText('溶媒'));

      await waitFor(() => {
        expect(screen.getByText('テスト溶媒')).toBeInTheDocument();
      });
    });
  });

  describe('部品グループ操作', () => {
    it('グループ一覧が表示される', async () => {
      const groups = [buildPartsGroup({ name: 'グループX' })];
      mockApi.getAllGroups.mockResolvedValue(groups);

      render(<DatabaseEditor />);

      await waitFor(() => {
        expect(screen.getByText('グループX')).toBeInTheDocument();
      });
    });

    it('新規グループ追加: 名前入力→追加ボタン→createGroup呼び出し', async () => {
      const user = userEvent.setup();
      mockApi.getAllGroups.mockResolvedValue([]);

      render(<DatabaseEditor />);

      const nameInput = screen.getByPlaceholderText('グループ名');
      await user.type(nameInput, '新しいグループ');
      await user.click(screen.getByText('追加'));

      expect(mockApi.createGroup).toHaveBeenCalledWith({
        name: '新しいグループ',
        description: undefined,
      });
    });

    it('グループ削除: confirmダイアログ→deleteGroup呼び出し', async () => {
      const user = userEvent.setup();
      const groups = [buildPartsGroup({ name: 'テスト' })];
      mockApi.getAllGroups.mockResolvedValue(groups);

      render(<DatabaseEditor />);

      await waitFor(() => expect(screen.getByText('テスト')).toBeInTheDocument());

      const deleteBtn = screen.getAllByText('削除').find(
        (el) => el.closest('.bg-red-600') || el.className.includes('bg-red')
      );
      if (deleteBtn) await user.click(deleteBtn);

      expect(window.confirm).toHaveBeenCalled();
    });

    it('部品追加ボタンでフォーム表示', async () => {
      const user = userEvent.setup();
      const groups = [buildPartsGroup()];
      mockApi.getAllGroups.mockResolvedValue(groups);

      render(<DatabaseEditor />);

      await waitFor(() => expect(screen.getByText('部品追加')).toBeInTheDocument());
      await user.click(screen.getByText('部品追加'));

      expect(screen.getByPlaceholderText('部品名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('δD')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('R₀')).toBeInTheDocument();
    });

    it('部品テーブルに部品一覧が表示される', async () => {
      const groups = [buildPartsGroup({
        parts: [
          { id: 1, groupId: 1, name: 'PSテスト', materialType: 'PS', hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 }, r0: 5.3, notes: null },
        ],
      })];
      mockApi.getAllGroups.mockResolvedValue(groups);

      render(<DatabaseEditor />);

      await waitFor(() => {
        expect(screen.getByText('PSテスト')).toBeInTheDocument();
        expect(screen.getByText('PS')).toBeInTheDocument();
      });
    });

    it('空グループには「部品がありません」を表示', async () => {
      const groups = [buildPartsGroup({ parts: [] })];
      mockApi.getAllGroups.mockResolvedValue(groups);

      render(<DatabaseEditor />);

      await waitFor(() => {
        expect(screen.getByText('部品がありません')).toBeInTheDocument();
      });
    });
  });

    it('部品追加フォームで保存→createPartが呼ばれる', async () => {
      const user = userEvent.setup();
      const groups = [buildPartsGroup({ id: 1 })];
      mockApi.getAllGroups.mockResolvedValue(groups);

      render(<DatabaseEditor />);

      await waitFor(() => expect(screen.getByText('部品追加')).toBeInTheDocument());
      await user.click(screen.getByText('部品追加'));

      await user.type(screen.getByPlaceholderText('部品名'), 'テスト部品');
      await user.type(screen.getByPlaceholderText('材料種別'), 'PP');
      await user.type(screen.getByPlaceholderText('δD'), '18.0');
      await user.type(screen.getByPlaceholderText('δP'), '3.0');
      await user.type(screen.getByPlaceholderText('δH'), '2.0');
      await user.type(screen.getByPlaceholderText('R₀'), '4.0');
      await user.click(screen.getByText('保存'));

      expect(mockApi.createPart).toHaveBeenCalledWith({
        groupId: 1,
        name: 'テスト部品',
        materialType: 'PP',
        deltaD: 18,
        deltaP: 3,
        deltaH: 2,
        r0: 4,
      });
    });

    it('部品削除→confirm→deletePartが呼ばれる', async () => {
      const user = userEvent.setup();
      const groups = [buildPartsGroup({
        parts: [{ id: 99, groupId: 1, name: '削除対象', materialType: null, hsp: { deltaD: 1, deltaP: 1, deltaH: 1 }, r0: 1, notes: null }],
      })];
      mockApi.getAllGroups.mockResolvedValue(groups);

      render(<DatabaseEditor />);

      await waitFor(() => expect(screen.getByText('削除対象')).toBeInTheDocument());

      // 部品行の削除ボタン（テキスト「削除」のリンク）
      const partDeleteBtns = screen.getAllByText('削除').filter(
        (el) => el.className.includes('text-red-600')
      );
      if (partDeleteBtns.length > 0) await user.click(partDeleteBtns[0]);

      expect(mockApi.deletePart).toHaveBeenCalledWith(99);
    });

    it('グループ名と説明を入力して追加', async () => {
      const user = userEvent.setup();
      mockApi.getAllGroups.mockResolvedValue([]);

      render(<DatabaseEditor />);

      await user.type(screen.getByPlaceholderText('グループ名'), 'テスト');
      await user.type(screen.getByPlaceholderText('説明（任意）'), '説明文');
      await user.click(screen.getByText('追加'));

      expect(mockApi.createGroup).toHaveBeenCalledWith({
        name: 'テスト',
        description: '説明文',
      });
    });

  describe('溶媒操作', () => {
    it('溶媒検索入力でsearchSolventsが呼ばれる', async () => {
      const user = userEvent.setup();

      render(<DatabaseEditor />);
      await user.click(screen.getByText('溶媒'));

      const searchInput = screen.getByPlaceholderText('溶媒を検索...');
      await user.type(searchInput, 'アセトン');

      await waitFor(() => {
        expect(mockApi.searchSolvents).toHaveBeenCalledWith('アセトン');
      });
    });

    it('新規追加ボタンでフォーム表示', async () => {
      const user = userEvent.setup();

      render(<DatabaseEditor />);
      await user.click(screen.getByText('溶媒'));
      await user.click(screen.getByText('新規追加'));

      expect(screen.getByPlaceholderText('日本語名 *')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('δD *')).toBeInTheDocument();
    });

    it('溶媒追加フォームで保存→createSolventが呼ばれる', async () => {
      const user = userEvent.setup();

      render(<DatabaseEditor />);
      await user.click(screen.getByText('溶媒'));
      await user.click(screen.getByText('新規追加'));

      await user.type(screen.getByPlaceholderText('日本語名 *'), 'テスト溶媒');
      await user.type(screen.getByPlaceholderText('英語名'), 'TestSolvent');
      await user.type(screen.getByPlaceholderText('CAS番号'), '123-45-6');
      await user.type(screen.getByPlaceholderText('δD *'), '15.0');
      await user.type(screen.getByPlaceholderText('δP *'), '5.0');
      await user.type(screen.getByPlaceholderText('δH *'), '3.0');

      await user.click(screen.getByText('保存'));

      expect(mockApi.createSolvent).toHaveBeenCalledWith({
        name: 'テスト溶媒',
        nameEn: 'TestSolvent',
        casNumber: '123-45-6',
        deltaD: 15,
        deltaP: 5,
        deltaH: 3,
        molarVolume: undefined,
        molWeight: undefined,
      });
    });

    it('溶媒削除→confirm→deleteSolventが呼ばれる', async () => {
      const user = userEvent.setup();
      const solvents = [buildSolvent({ id: 77, name: '削除溶媒' })];
      mockApi.searchSolvents.mockResolvedValue(solvents);

      render(<DatabaseEditor />);
      await user.click(screen.getByText('溶媒'));

      await waitFor(() => expect(screen.getByText('削除溶媒')).toBeInTheDocument());

      const deleteBtns = screen.getAllByText('削除').filter(
        (el) => el.className.includes('text-red-600')
      );
      if (deleteBtns.length > 0) await user.click(deleteBtns[0]);

      expect(mockApi.deleteSolvent).toHaveBeenCalledWith(77);
    });

    it('溶媒件数が表示される', async () => {
      const solvents = [buildSolvent(), buildSolvent()];
      mockApi.searchSolvents.mockResolvedValue(solvents);

      render(<DatabaseEditor />);
      await screen.findByText('溶媒');
      const user = userEvent.setup();
      await user.click(screen.getByText('溶媒'));

      await waitFor(() => {
        expect(screen.getByText('2 件の溶媒')).toBeInTheDocument();
      });
    });
  });
});
