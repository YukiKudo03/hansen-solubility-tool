// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ErrorBoundary from '../../../src/renderer/components/ErrorBoundary';

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('テストエラー');
  return <div>正常表示</div>;
}

describe('ErrorBoundary', () => {
  // suppress console.error from React error boundary
  const originalError = console.error;
  beforeEach(() => { console.error = vi.fn(); });
  afterEach(() => { console.error = originalError; });

  it('子コンポーネントが正常な場合はそのまま表示', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('正常表示')).toBeInTheDocument();
  });

  it('子コンポーネントがthrowした場合にフォールバックUIを表示', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
  });

  it('エラーメッセージが表示される', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('テストエラー')).toBeInTheDocument();
  });

  it('「再試行」ボタンでリセットできる', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function Controllable() {
      if (shouldThrow) throw new Error('一時エラー');
      return <div>復帰成功</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Controllable />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();

    shouldThrow = false;
    await user.click(screen.getByText('再試行'));

    // ErrorBoundaryがリセットされ、子が再レンダリングされる
    // Note: happy-domでは再レンダリングが必要
    rerender(
      <ErrorBoundary>
        <Controllable />
      </ErrorBoundary>,
    );

    expect(screen.getByText('復帰成功')).toBeInTheDocument();
  });
});
