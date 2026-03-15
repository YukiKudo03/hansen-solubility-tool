// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RiskBadge from '../../../src/renderer/components/RiskBadge';
import { RiskLevel } from '../../../src/core/types';

describe('RiskBadge', () => {
  it('Level 1: 「危険」を表示', () => {
    render(<RiskBadge level={RiskLevel.Dangerous} />);
    expect(screen.getByText('危険')).toBeInTheDocument();
    expect(screen.getByText('Level 1')).toBeInTheDocument();
  });

  it('Level 2: 「要警戒」を表示', () => {
    render(<RiskBadge level={RiskLevel.Warning} />);
    expect(screen.getByText('要警戒')).toBeInTheDocument();
  });

  it('Level 3: 「要注意」を表示', () => {
    render(<RiskBadge level={RiskLevel.Caution} />);
    expect(screen.getByText('要注意')).toBeInTheDocument();
  });

  it('Level 4: 「保留」を表示', () => {
    render(<RiskBadge level={RiskLevel.Hold} />);
    expect(screen.getByText('保留')).toBeInTheDocument();
  });

  it('Level 5: 「安全」を表示', () => {
    render(<RiskBadge level={RiskLevel.Safe} />);
    expect(screen.getByText('安全')).toBeInTheDocument();
  });

  it('redプロパティ指定時にRED値を表示', () => {
    render(<RiskBadge level={RiskLevel.Warning} red={0.638} />);
    expect(screen.getByText('(RED: 0.638)')).toBeInTheDocument();
  });

  it('redプロパティ未指定時はRED値を表示しない', () => {
    render(<RiskBadge level={RiskLevel.Warning} />);
    expect(screen.queryByText(/RED:/)).not.toBeInTheDocument();
  });

  it('全レベルがクラッシュなくレンダリング', () => {
    for (const level of [1, 2, 3, 4, 5] as RiskLevel[]) {
      const { unmount } = render(<RiskBadge level={level} red={1.0} />);
      unmount();
    }
  });
});
