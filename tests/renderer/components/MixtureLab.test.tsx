// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import MixtureLab from '../../../src/renderer/components/MixtureLab';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('MixtureLab', () => {
  it('初期表示: 2行の成分入力と追加ボタンが表示される', () => {
    render(<MixtureLab />);
    expect(screen.getByText('混合溶媒の作成')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('溶媒を検索...').length).toBe(2);
    expect(screen.getByText('+ 溶媒を追加')).toBeInTheDocument();
  });

  it('溶媒追加ボタンで行が増える', async () => {
    const user = userEvent.setup();
    render(<MixtureLab />);

    await user.click(screen.getByText('+ 溶媒を追加'));
    expect(screen.getAllByPlaceholderText('溶媒を検索...').length).toBe(3);
  });

  it('削除ボタンで行が減る', async () => {
    const user = userEvent.setup();
    render(<MixtureLab />);

    // 3行にする
    await user.click(screen.getByText('+ 溶媒を追加'));
    expect(screen.getAllByPlaceholderText('溶媒を検索...').length).toBe(3);

    // 1行削除
    const deleteButtons = screen.getAllByText('削除');
    await user.click(deleteButtons[0]);
    expect(screen.getAllByPlaceholderText('溶媒を検索...').length).toBe(2);
  });

  it('最後の1行は削除できない', async () => {
    const user = userEvent.setup();
    render(<MixtureLab />);

    // 1行削除して1行にする
    const deleteButtons = screen.getAllByText('削除');
    await user.click(deleteButtons[0]);
    expect(screen.getAllByPlaceholderText('溶媒を検索...').length).toBe(1);

    // 残りの削除ボタンはdisabled
    const lastDeleteBtn = screen.getByText('削除');
    expect(lastDeleteBtn).toBeDisabled();
  });

  it('溶媒を検索してドロップダウンが表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'トルエン' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);

    render(<MixtureLab />);

    const inputs = screen.getAllByPlaceholderText('溶媒を検索...');
    await user.click(inputs[0]);
    await user.type(inputs[0], 'トル');

    await waitFor(() => {
      expect(screen.getByText(/トルエン/)).toBeInTheDocument();
    });
  });

  it('溶媒選択後に計算結果が表示される', async () => {
    const user = userEvent.setup();
    const toluene = buildSolvent({ id: 1, name: 'トルエン', hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 } });
    const ethanol = buildSolvent({ id: 2, name: 'エタノール', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } });
    mockApi.searchSolvents.mockResolvedValue([toluene]);
    mockApi.getAllSolvents.mockResolvedValue([toluene, ethanol]);

    render(<MixtureLab />);

    // 1行目でトルエン選択
    const inputs = screen.getAllByPlaceholderText('溶媒を検索...');
    await user.click(inputs[0]);
    await waitFor(() => expect(screen.getByText(/トルエン/)).toBeInTheDocument());
    await user.click(screen.getByText(/トルエン/));

    // 2行目でエタノール選択
    mockApi.searchSolvents.mockResolvedValue([ethanol]);
    await user.click(inputs[1]);
    await user.type(inputs[1], 'エタ');
    await waitFor(() => expect(screen.getByText(/エタノール/)).toBeInTheDocument());
    await user.click(screen.getByText(/エタノール/));

    // 計算結果が表示される
    await waitFor(() => {
      expect(screen.getByText('混合予測結果')).toBeInTheDocument();
      expect(screen.getByText(/δD:/)).toBeInTheDocument();
    });
  });

  it('名前未入力でDB登録するとエラー', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'テスト溶媒' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.getAllSolvents.mockResolvedValue([solvent]);

    render(<MixtureLab />);

    // 両方の行に同じ溶媒を選択（計算結果を表示させるため）
    const inputs = screen.getAllByPlaceholderText('溶媒を検索...');
    await user.click(inputs[0]);
    await waitFor(() => expect(screen.getByText(/テスト溶媒/)).toBeInTheDocument());
    await user.click(screen.getByText(/テスト溶媒/));

    mockApi.searchSolvents.mockResolvedValue([solvent]);
    await user.click(inputs[1]);
    await waitFor(() => expect(screen.getAllByText(/テスト溶媒/).length).toBeGreaterThan(0));
    await user.click(screen.getAllByText(/テスト溶媒/)[0]);

    await waitFor(() => expect(screen.getByText('データベースに登録')).toBeInTheDocument());

    // 名前未入力で登録
    await user.click(screen.getByText('データベースに登録'));

    await waitFor(() => {
      expect(screen.getByText('混合溶媒の名前を入力してください')).toBeInTheDocument();
    });
  });

  it('DB登録成功でメッセージ表示', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'テスト溶媒' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.getAllSolvents.mockResolvedValue([solvent]);

    render(<MixtureLab />);

    // 両行に溶媒選択
    const inputs = screen.getAllByPlaceholderText('溶媒を検索...');
    await user.click(inputs[0]);
    await waitFor(() => expect(screen.getByText(/テスト溶媒/)).toBeInTheDocument());
    await user.click(screen.getByText(/テスト溶媒/));

    mockApi.searchSolvents.mockResolvedValue([solvent]);
    await user.click(inputs[1]);
    await waitFor(() => expect(screen.getAllByText(/テスト溶媒/).length).toBeGreaterThan(0));
    await user.click(screen.getAllByText(/テスト溶媒/)[0]);

    await waitFor(() => expect(screen.getByText('データベースに登録')).toBeInTheDocument());

    // 名前入力してDB登録
    const nameInput = screen.getByPlaceholderText(/混合溶媒の名前/);
    await user.type(nameInput, 'テスト混合液');
    await user.click(screen.getByText('データベースに登録'));

    await waitFor(() => {
      expect(mockApi.createMixtureSolvent).toHaveBeenCalled();
      expect(screen.getByText(/テスト混合液.*データベースに登録しました/)).toBeInTheDocument();
    });
  });
});
