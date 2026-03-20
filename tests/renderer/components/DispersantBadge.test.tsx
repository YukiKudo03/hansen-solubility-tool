// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DispersantBadge from '../../../src/renderer/components/DispersantBadge';
import { DispersantAffinityLevel } from '../../../src/core/types';

describe('DispersantBadge', () => {
  it('優秀レベルを正しく表示', () => {
    render(<DispersantBadge level={DispersantAffinityLevel.Excellent} red={0.3} />);
    expect(screen.getByText('優秀')).toBeInTheDocument();
    expect(screen.getByText('(RED: 0.300)')).toBeInTheDocument();
  });

  it('良好レベルを正しく表示', () => {
    render(<DispersantBadge level={DispersantAffinityLevel.Good} red={0.7} />);
    expect(screen.getByText('良好')).toBeInTheDocument();
  });

  it('可能レベルを正しく表示', () => {
    render(<DispersantBadge level={DispersantAffinityLevel.Fair} />);
    expect(screen.getByText('可能')).toBeInTheDocument();
  });

  it('不良レベルを正しく表示', () => {
    render(<DispersantBadge level={DispersantAffinityLevel.Poor} />);
    expect(screen.getByText('不良')).toBeInTheDocument();
  });

  it('不適レベルを正しく表示', () => {
    render(<DispersantBadge level={DispersantAffinityLevel.Bad} />);
    expect(screen.getByText('不適')).toBeInTheDocument();
  });

  it('red省略時にRED表示なし', () => {
    render(<DispersantBadge level={DispersantAffinityLevel.Good} />);
    expect(screen.getByText('良好')).toBeInTheDocument();
    expect(screen.queryByText(/RED/)).not.toBeInTheDocument();
  });
});
