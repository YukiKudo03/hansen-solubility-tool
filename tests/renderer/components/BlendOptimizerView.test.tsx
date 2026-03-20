// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import BlendOptimizerView from '../../../src/renderer/components/BlendOptimizerView';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

const mockOptResult = {
  targetHSP: { deltaD: 18.0, deltaP: 10.0, deltaH: 12.0 },
  topResults: [
    {
      components: [
        { solvent: { id: 1, name: '溶媒A', hsp: { deltaD: 16, deltaP: 8, deltaH: 10 } }, volumeFraction: 0.6 },
        { solvent: { id: 2, name: '溶媒B', hsp: { deltaD: 20, deltaP: 12, deltaH: 14 } }, volumeFraction: 0.4 },
      ],
      blendHSP: { deltaD: 17.6, deltaP: 9.6, deltaH: 11.6 },
      ra: 0.85,
    },
  ],
};

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('BlendOptimizerView', () => {
  it('タイトルが表示される', async () => {
    render(<BlendOptimizerView />);
    expect(screen.getByText('溶剤ブレンド最適化')).toBeInTheDocument();
    await waitFor(() => {});
  });

  it('溶媒リストが読み込まれチェックボックスで表示される', async () => {
    const solvents = [
      buildSolvent({ name: 'トルエン' }),
      buildSolvent({ name: 'アセトン' }),
      buildSolvent({ name: 'メタノール' }),
    ];
    mockApi.searchSolvents.mockResolvedValue(solvents);

    render(<BlendOptimizerView />);

    await waitFor(() => {
      expect(screen.getByText('トルエン')).toBeInTheDocument();
      expect(screen.getByText('アセトン')).toBeInTheDocument();
      expect(screen.getByText('メタノール')).toBeInTheDocument();
    });
  });

  it('全選択ボタンで全溶媒が選択される', async () => {
    const user = userEvent.setup();
    const solvents = [buildSolvent({ name: 'A' }), buildSolvent({ name: 'B' })];
    mockApi.searchSolvents.mockResolvedValue(solvents);

    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());

    await user.click(screen.getByText('全選択'));

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
  });

  it('全解除ボタンで全溶媒が解除される', async () => {
    const user = userEvent.setup();
    const solvents = [buildSolvent({ name: 'A' }), buildSolvent({ name: 'B' })];
    mockApi.searchSolvents.mockResolvedValue(solvents);

    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());

    await user.click(screen.getByText('全選択'));
    await user.click(screen.getByText('全解除'));

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
  });

  it('参照タイプ切替で選択肢が変わる', async () => {
    const user = userEvent.setup();
    mockApi.getAllGroups.mockResolvedValue([]);
    mockApi.getAllDrugs.mockResolvedValue([]);

    render(<BlendOptimizerView />);

    const refSelect = screen.getByLabelText('参照元');

    // 薬物に切り替え
    await user.selectOptions(refSelect, 'drug');
    expect(screen.getByLabelText('薬物')).toBeInTheDocument();

    // ナノ粒子に切り替え
    mockApi.getAllNanoParticles.mockResolvedValue([]);
    await user.selectOptions(refSelect, 'nanoparticle');
    await waitFor(() => {
      expect(screen.getByLabelText('ナノ粒子')).toBeInTheDocument();
    });
  });

  it('2種未満選択時に警告メッセージが表示される', async () => {
    render(<BlendOptimizerView />);

    expect(screen.getByText('2種類以上の溶媒を選択してください。')).toBeInTheDocument();
    await waitFor(() => {});
  });

  it('最適化実行で結果テーブルが表示される', async () => {
    const user = userEvent.setup();
    const solvents = [
      buildSolvent({ id: 1, name: '溶媒A' }),
      buildSolvent({ id: 2, name: '溶媒B' }),
    ];
    mockApi.searchSolvents.mockResolvedValue(solvents);
    mockApi.optimizeBlend.mockResolvedValue(mockOptResult);

    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByText('溶媒A')).toBeInTheDocument());

    // 全選択
    await user.click(screen.getByText('全選択'));

    // HSP入力
    const inputs = screen.getAllByRole('spinbutton');
    // δD, δP, δH, stepSize, topN の順
    await user.clear(inputs[0]);
    await user.type(inputs[0], '18');
    await user.clear(inputs[1]);
    await user.type(inputs[1], '10');
    await user.clear(inputs[2]);
    await user.type(inputs[2], '12');

    // 実行
    await user.click(screen.getByText('ブレンド最適化実行'));

    await waitFor(() => {
      expect(screen.getByText(/最適化結果/)).toBeInTheDocument();
      expect(screen.getByText('0.850')).toBeInTheDocument(); // Ra value
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    const solvents = [
      buildSolvent({ id: 1, name: '溶媒A' }),
      buildSolvent({ id: 2, name: '溶媒B' }),
    ];
    mockApi.searchSolvents.mockResolvedValue(solvents);
    mockApi.optimizeBlend.mockRejectedValue(new Error('計算エラー'));

    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByText('溶媒A')).toBeInTheDocument());

    await user.click(screen.getByText('全選択'));

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '18');
    await user.clear(inputs[1]);
    await user.type(inputs[1], '10');
    await user.clear(inputs[2]);
    await user.type(inputs[2], '12');

    await user.click(screen.getByText('ブレンド最適化実行'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('計算エラー')).toBeInTheDocument();
    });
  });
});
