// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import BlendOptimizerView from '../../src/renderer/components/BlendOptimizerView';
import { setupMockApi } from './setup';
import { resetIdCounter } from './factories';

beforeEach(() => {
  resetIdCounter();
  const mockApi = setupMockApi();
  // Parts groups with HSP values
  mockApi.getAllGroups.mockResolvedValue([
    {
      id: 1,
      name: 'テストグループ',
      description: null,
      parts: [
        { id: 1, groupId: 1, name: 'PMMA', materialType: 'polymer', hsp: { deltaD: 18.6, deltaP: 10.5, deltaH: 7.5 }, r0: 5.5, notes: null },
        { id: 2, groupId: 1, name: 'PVC', materialType: 'polymer', hsp: { deltaD: 18.2, deltaP: 7.5, deltaH: 8.3 }, r0: 3.5, notes: null },
      ],
    },
  ]);
  // Drugs with HSP values
  mockApi.getAllDrugs.mockResolvedValue([
    { id: 1, name: 'アセトアミノフェン', nameEn: 'Acetaminophen', casNumber: null, hsp: { deltaD: 17.2, deltaP: 9.4, deltaH: 13.3 }, r0: 5.0, molWeight: 151.16, logP: 0.46, therapeuticCategory: '鎮痛薬', notes: null },
  ]);
  // NanoParticles
  mockApi.getAllNanoParticles.mockResolvedValue([
    { id: 1, name: 'SWCNT', nameEn: 'SWCNT', category: 'carbon', coreMaterial: 'SWCNT', surfaceLigand: null, hsp: { deltaD: 19.4, deltaP: 6.0, deltaH: 4.5 }, r0: 5.0, particleSize: null, notes: null },
  ]);
  // Solvents for the view to render
  mockApi.getAllSolvents.mockResolvedValue([
    { id: 1, name: 'Toluene', nameEn: null, casNumber: null, hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null },
    { id: 2, name: 'Ethanol', nameEn: null, casNumber: null, hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 }, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null },
  ]);
});

describe('BlendOptimizerView - 材料からターゲットHSP参照', () => {
  it('「材料から参照」セクションが表示される', async () => {
    render(<BlendOptimizerView />);
    await waitFor(() => {
      expect(screen.getByText('材料から参照')).toBeInTheDocument();
    });
  });

  it('エンティティ種別セレクタが表示される', async () => {
    render(<BlendOptimizerView />);
    await waitFor(() => {
      expect(screen.getByText('参照元')).toBeInTheDocument();
    });
    const typeSelect = screen.getByRole('combobox', { name: /参照元/ });
    expect(typeSelect).toBeInTheDocument();
  });

  it('Part選択時にグループ→部品の2段階セレクタが表示される', async () => {
    const user = userEvent.setup();
    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /参照元/ })).toBeInTheDocument());

    await user.selectOptions(screen.getByRole('combobox', { name: /参照元/ }), 'part');
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /グループ/ })).toBeInTheDocument();
    });
  });

  it('Part選択でδD/δP/δHが自動入力される', async () => {
    const user = userEvent.setup();
    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /参照元/ })).toBeInTheDocument());

    // Select "Part" type
    await user.selectOptions(screen.getByRole('combobox', { name: /参照元/ }), 'part');
    await waitFor(() => expect(screen.getByRole('combobox', { name: /グループ/ })).toBeInTheDocument());

    // Select group
    await user.selectOptions(screen.getByRole('combobox', { name: /グループ/ }), '1');
    await waitFor(() => expect(screen.getByRole('combobox', { name: /材料/ })).toBeInTheDocument());

    // Select part (PMMA)
    await user.selectOptions(screen.getByRole('combobox', { name: /材料/ }), '1');

    // Check HSP values are filled
    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(18.6);
      expect(inputs[1]).toHaveValue(10.5);
      expect(inputs[2]).toHaveValue(7.5);
    });
  });

  it('Drug選択でδD/δP/δHが自動入力される', async () => {
    const user = userEvent.setup();
    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /参照元/ })).toBeInTheDocument());

    await user.selectOptions(screen.getByRole('combobox', { name: /参照元/ }), 'drug');
    await waitFor(() => expect(screen.getByRole('combobox', { name: /薬物/ })).toBeInTheDocument());

    await user.selectOptions(screen.getByRole('combobox', { name: /薬物/ }), '1');

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(17.2);
      expect(inputs[1]).toHaveValue(9.4);
      expect(inputs[2]).toHaveValue(13.3);
    });
  });

  it('NanoParticle選択でδD/δP/δHが自動入力される', async () => {
    const user = userEvent.setup();
    render(<BlendOptimizerView />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /参照元/ })).toBeInTheDocument());

    await user.selectOptions(screen.getByRole('combobox', { name: /参照元/ }), 'nanoparticle');
    await waitFor(() => expect(screen.getByRole('combobox', { name: /ナノ粒子/ })).toBeInTheDocument());

    await user.selectOptions(screen.getByRole('combobox', { name: /ナノ粒子/ }), '1');

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(19.4);
      expect(inputs[1]).toHaveValue(6.0);
      expect(inputs[2]).toHaveValue(4.5);
    });
  });
});
