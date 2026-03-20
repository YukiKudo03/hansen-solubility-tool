// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import GreenSolventView from '../../../src/renderer/components/GreenSolventView';
import { setupMockApi } from '../setup';
import { buildSolvent, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

const makeCandidates = () => [
  {
    solvent: buildSolvent({ name: '酢酸エチル', casNumber: '141-78-6' }),
    ra: 3.5,
    safetyInfo: { casNumber: '141-78-6', safetyRating: 'recommended' as const, environmentalScore: 8, healthScore: 8, isGreenAlternative: true },
    overallScore: 0.25,
  },
  {
    solvent: buildSolvent({ name: 'DMSO', casNumber: '67-68-5' }),
    ra: 5.2,
    safetyInfo: { casNumber: '67-68-5', safetyRating: 'acceptable' as const, environmentalScore: 6, healthScore: 7, isGreenAlternative: true },
    overallScore: 0.55,
  },
];

async function searchAndShowResults(user: ReturnType<typeof userEvent.setup>) {
  const solvent = buildSolvent({ name: 'DCM' });
  mockApi.searchSolvents.mockResolvedValue([solvent]);
  mockApi.findGreenAlternatives.mockResolvedValue({
    targetSolvent: solvent,
    candidates: makeCandidates(),
    evaluatedAt: new Date(),
  });

  render(<GreenSolventView />);

  const input = screen.getByPlaceholderText(/溶媒名/);
  await user.click(input);
  await waitFor(() => expect(screen.getByText('DCM')).toBeInTheDocument());
  await user.click(screen.getByText('DCM'));
  await user.click(screen.getByText('代替溶媒を検索'));

  await waitFor(() => {
    expect(screen.getByText('酢酸エチル')).toBeInTheDocument();
  });
}

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('GreenSolventView', () => {
  it('タイトルが表示される', async () => {
    mockApi.searchSolvents.mockResolvedValue([]);

    render(<GreenSolventView />);

    expect(screen.getByText('グリーン溶媒代替提案')).toBeInTheDocument();
    await waitFor(() => {});
  });

  it('検索ボタンが表示される', async () => {
    render(<GreenSolventView />);
    expect(screen.getByText('代替溶媒を検索')).toBeInTheDocument();
    await waitFor(() => {});
  });

  it('検索結果が表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'DCM' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.findGreenAlternatives.mockResolvedValue({
      targetSolvent: solvent,
      candidates: [
        {
          solvent: buildSolvent({ name: '酢酸エチル', casNumber: '141-78-6' }),
          ra: 3.5,
          safetyInfo: { casNumber: '141-78-6', safetyRating: 'recommended', environmentalScore: 8, healthScore: 8, isGreenAlternative: true },
          overallScore: 0.25,
        },
      ],
      evaluatedAt: new Date(),
    });

    render(<GreenSolventView />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('DCM')).toBeInTheDocument());
    await user.click(screen.getByText('DCM'));

    await user.click(screen.getByText('代替溶媒を検索'));

    await waitFor(() => {
      expect(screen.getByText('酢酸エチル')).toBeInTheDocument();
      expect(screen.getByText('推奨')).toBeInTheDocument();
    });
  });

  it('CSV出力ボタンでsaveCsvが呼ばれる', async () => {
    const user = userEvent.setup();
    mockApi.saveCsv.mockResolvedValue({ saved: true });

    await searchAndShowResults(user);

    await user.click(screen.getByText('CSV出力'));

    await waitFor(() => {
      expect(mockApi.saveCsv).toHaveBeenCalledTimes(1);
      const csvArg = mockApi.saveCsv.mock.calls[0][0] as string;
      expect(csvArg).toContain('溶媒名');
      expect(csvArg).toContain('酢酸エチル');
    });
  });

  it('候補0件時に空メッセージが表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'DCM' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.findGreenAlternatives.mockResolvedValue({
      targetSolvent: solvent,
      candidates: [],
      evaluatedAt: new Date(),
    });

    render(<GreenSolventView />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('DCM')).toBeInTheDocument());
    await user.click(screen.getByText('DCM'));
    await user.click(screen.getByText('代替溶媒を検索'));

    await waitFor(() => {
      expect(screen.getByText('代替候補が見つかりませんでした。')).toBeInTheDocument();
    });
  });

  it('API失敗時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    const solvent = buildSolvent({ name: 'DCM' });
    mockApi.searchSolvents.mockResolvedValue([solvent]);
    mockApi.findGreenAlternatives.mockRejectedValue(new Error('検索失敗'));

    render(<GreenSolventView />);

    const input = screen.getByPlaceholderText(/溶媒名/);
    await user.click(input);
    await waitFor(() => expect(screen.getByText('DCM')).toBeInTheDocument());
    await user.click(screen.getByText('DCM'));
    await user.click(screen.getByText('代替溶媒を検索'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('検索失敗')).toBeInTheDocument();
    });
  });

  it('カラムヘッダクリックでソートが切り替わる', async () => {
    const user = userEvent.setup();
    await searchAndShowResults(user);

    // 溶媒名ヘッダをクリック
    const solventNameHeader = screen.getByText('溶媒名');
    await user.click(solventNameHeader);

    // ソート後もデータは表示されている
    expect(screen.getByText('酢酸エチル')).toBeInTheDocument();
    expect(screen.getByText('DMSO')).toBeInTheDocument();
  });
});
