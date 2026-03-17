// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import BookmarkButton from '../../../src/renderer/components/BookmarkButton';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('BookmarkButton', () => {
  const defaultProps = {
    pipeline: 'risk' as const,
    params: { partsGroupId: 1, solventId: 2 },
    disabled: false,
  };

  it('「☆ 保存」ボタンが表示される', () => {
    render(<BookmarkButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument();
  });

  it('disabled=trueでボタンが無効化される', () => {
    render(<BookmarkButton {...defaultProps} disabled={true} />);
    expect(screen.getByRole('button', { name: /保存/ })).toBeDisabled();
  });

  it('クリックで名前入力ダイアログが表示される', async () => {
    const user = userEvent.setup();
    render(<BookmarkButton {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /保存/ }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ブックマーク名/)).toBeInTheDocument();
    });
  });

  it('名前入力して保存でcreateBookmarkが呼ばれる', async () => {
    const user = userEvent.setup();
    mockApi.createBookmark.mockResolvedValue({ id: 1 });

    render(<BookmarkButton {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /保存/ }));
    await user.type(screen.getByPlaceholderText(/ブックマーク名/), 'PS×トルエン');
    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(mockApi.createBookmark).toHaveBeenCalledWith({
        name: 'PS×トルエン',
        pipeline: 'risk',
        paramsJson: '{"partsGroupId":1,"solventId":2}',
      });
    });
  });

  it('キャンセルでダイアログが閉じる', async () => {
    const user = userEvent.setup();
    render(<BookmarkButton {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /保存/ }));
    await waitFor(() => expect(screen.getByPlaceholderText(/ブックマーク名/)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/ブックマーク名/)).not.toBeInTheDocument();
    });
  });
});
