// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../../src/renderer/App';
import { setupMockApi } from './setup';
import { resetIdCounter } from './factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('App', () => {
  it('ヘッダーにアプリタイトル表示', () => {
    render(<App />);
    expect(screen.getByText('Hansen溶解度パラメータ 溶解性評価ツール')).toBeInTheDocument();
  });

  it('3タブが表示される', () => {
    render(<App />);
    expect(screen.getByText('溶解性評価')).toBeInTheDocument();
    expect(screen.getByText('データベース編集')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('初期タブが「溶解性評価」', () => {
    render(<App />);
    // ReportView固有のテキスト
    expect(screen.getByText('評価条件')).toBeInTheDocument();
  });

  it('「データベース編集」タブクリックでDB画面に切り替え', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('データベース編集'));

    await waitFor(() => {
      expect(screen.getByText('部品グループ')).toBeInTheDocument();
    });
  });

  it('「設定」タブクリックで設定画面に切り替え', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('設定'));

    await waitFor(() => {
      expect(screen.getByText('リスク判定閾値設定')).toBeInTheDocument();
    });
  });

  it('タブを切り替えて元に戻せる', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('設定'));
    await waitFor(() => expect(screen.getByText('リスク判定閾値設定')).toBeInTheDocument());

    await user.click(screen.getByText('溶解性評価'));
    await waitFor(() => expect(screen.getByText('評価条件')).toBeInTheDocument());
  });
});
