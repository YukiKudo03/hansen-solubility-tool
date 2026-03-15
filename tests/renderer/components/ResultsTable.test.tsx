// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ResultsTable from '../../../src/renderer/components/ResultsTable';
import { RiskLevel } from '../../../src/core/types';
import type { GroupEvaluationResult } from '../../../src/core/types';
import { buildSolvent, buildPartsGroup, resetIdCounter } from '../factories';

function makeResult(): GroupEvaluationResult {
  const solvent = buildSolvent({ name: 'トルエン' });
  const group = buildPartsGroup({
    parts: [
      { id: 101, groupId: 1, name: 'PartA', materialType: 'PS', hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 }, r0: 5.3, notes: null },
      { id: 102, groupId: 1, name: 'PartB', materialType: 'PE', hsp: { deltaD: 18.0, deltaP: 3.0, deltaH: 2.0 }, r0: 4.0, notes: null },
      { id: 103, groupId: 1, name: 'PartC', materialType: null, hsp: { deltaD: 20.0, deltaP: 12.0, deltaH: 11.5 }, r0: 12.7, notes: null },
    ],
  });
  return {
    partsGroup: group,
    solvent,
    results: [
      { part: group.parts[0], solvent, ra: 3.380, red: 0.638, riskLevel: RiskLevel.Warning },
      { part: group.parts[1], solvent, ra: 1.5, red: 0.375, riskLevel: RiskLevel.Dangerous },
      { part: group.parts[2], solvent, ra: 15.0, red: 1.181, riskLevel: RiskLevel.Caution },
    ],
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    thresholdsUsed: { dangerousMax: 0.5, warningMax: 0.8, cautionMax: 1.2, holdMax: 2.0 },
  };
}

beforeEach(() => resetIdCounter());

describe('ResultsTable', () => {
  it('全部品の行が表示される', () => {
    render(<ResultsTable result={makeResult()} />);
    expect(screen.getByText('PartA')).toBeInTheDocument();
    expect(screen.getByText('PartB')).toBeInTheDocument();
    expect(screen.getByText('PartC')).toBeInTheDocument();
  });

  it('HSP値が小数1桁で表示', () => {
    render(<ResultsTable result={makeResult()} />);
    expect(screen.getByText('18.5')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('Ra, RED値が小数3桁で表示', () => {
    render(<ResultsTable result={makeResult()} />);
    expect(screen.getByText('3.380')).toBeInTheDocument();
    expect(screen.getByText('0.638')).toBeInTheDocument();
  });

  it('materialTypeがnullの場合は「-」を表示', () => {
    render(<ResultsTable result={makeResult()} />);
    // PartCのmaterialTypeはnull
    const rows = screen.getAllByRole('row');
    const partCRow = rows.find(r => within(r).queryByText('PartC'));
    expect(partCRow).toBeTruthy();
    expect(within(partCRow!).getByText('-')).toBeInTheDocument();
  });

  it('リスクレベルでソート（デフォルト）', () => {
    render(<ResultsTable result={makeResult()} />);
    const rows = screen.getAllByRole('row');
    // ヘッダー除く。デフォルトはriskLevel ascなのでDangerous(1) -> Warning(2) -> Caution(3)
    const dataRows = rows.slice(1);
    expect(within(dataRows[0]).getByText('PartB')).toBeInTheDocument(); // Dangerous
    expect(within(dataRows[1]).getByText('PartA')).toBeInTheDocument(); // Warning
    expect(within(dataRows[2]).getByText('PartC')).toBeInTheDocument(); // Caution
  });

  it('カラムヘッダークリックでソート切り替え', async () => {
    const user = userEvent.setup();
    render(<ResultsTable result={makeResult()} />);

    // Raヘッダーをクリック → Ra昇順
    const raHeader = screen.getByText(/^Ra/);
    await user.click(raHeader);

    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('PartB')).toBeInTheDocument(); // Ra=1.5
    expect(within(rows[1]).getByText('PartA')).toBeInTheDocument(); // Ra=3.38
    expect(within(rows[2]).getByText('PartC')).toBeInTheDocument(); // Ra=15.0
  });

  it('同じヘッダー再クリックでasc/desc切り替え', async () => {
    const user = userEvent.setup();
    render(<ResultsTable result={makeResult()} />);

    // Raヘッダーを2回クリック (asc -> desc)
    await user.click(screen.getByText(/Ra/));
    await user.click(screen.getByText(/Ra/));

    const rows = screen.getAllByRole('row').slice(1);
    // desc: PartC(15.0) > PartA(3.38) > PartB(1.5)
    expect(within(rows[0]).getByText('PartC')).toBeInTheDocument();
  });

  it('部品名でソート', async () => {
    const user = userEvent.setup();
    render(<ResultsTable result={makeResult()} />);

    const nameHeader = screen.getByText(/^部品名/);
    await user.click(nameHeader);

    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('PartA')).toBeInTheDocument();
    expect(within(rows[1]).getByText('PartB')).toBeInTheDocument();
    expect(within(rows[2]).getByText('PartC')).toBeInTheDocument();
  });

  it('RiskBadgeが各行に表示される', () => {
    render(<ResultsTable result={makeResult()} />);
    expect(screen.getByText('危険')).toBeInTheDocument();
    expect(screen.getByText('要警戒')).toBeInTheDocument();
    expect(screen.getByText('要注意')).toBeInTheDocument();
  });
});
