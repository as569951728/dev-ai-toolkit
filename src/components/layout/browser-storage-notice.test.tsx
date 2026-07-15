import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BrowserStorageNotice } from '@/components/layout/browser-storage-notice';
import {
  downloadLocalStorageRecovery,
  getLocalStorageReadIssues,
  reportLocalStorageReadIssue,
} from '@/lib/local-storage-recovery';

vi.mock('@/lib/local-storage-recovery', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/local-storage-recovery')>();

  return {
    ...actual,
    downloadLocalStorageRecovery: vi.fn(actual.downloadLocalStorageRecovery),
  };
});

describe('BrowserStorageNotice', () => {
  it('stays hidden when browser storage is readable', () => {
    render(
      <BrowserStorageNotice
        storage={{
          getItem() {
            return null;
          },
          setItem() {},
        }}
      />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('warns when browser storage cannot be read', () => {
    render(
      <BrowserStorageNotice
        storage={{
          getItem() {
            throw new DOMException('Access denied.', 'SecurityError');
          },
          setItem() {},
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Browser storage is unavailable. Templates, prompt snapshots, and notes cannot be saved in this browser context.',
    );
  });

  it('lists unreadable collections without exposing their raw content', () => {
    reportLocalStorageReadIssue({
      label: 'Prompt templates',
      rawValue: 'private malformed prompt data',
      reason: 'invalid-json',
      storageKey: 'templates',
    });

    render(
      <BrowserStorageNotice
        storage={{
          getItem() {
            return null;
          },
          setItem() {},
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Some local workspace data could not be read.',
    );
    expect(screen.getByText('Prompt templates')).toBeInTheDocument();
    expect(
      screen.queryByText('private malformed prompt data'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download unreadable data' }),
    ).toBeInTheDocument();
  });

  it('requires confirmation before resetting affected browser data', () => {
    const state = new Map([['templates', '{not-json']]);
    const reloadPage = vi.fn();
    const removeItem = vi.fn((key: string) => state.delete(key));

    reportLocalStorageReadIssue({
      label: 'Prompt templates',
      rawValue: '{not-json',
      reason: 'invalid-json',
      storageKey: 'templates',
    });

    render(
      <BrowserStorageNotice
        reloadPage={reloadPage}
        storage={{
          getItem(key) {
            return state.get(key) ?? null;
          },
          removeItem,
          setItem(key, value) {
            state.set(key, value);
          },
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset affected data' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Reset unreadable local data?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Keep current data' }),
    ).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Reset and reload' }));

    expect(removeItem).toHaveBeenCalledWith('templates');
    expect(state.has('templates')).toBe(false);
    expect(getLocalStorageReadIssues()).toEqual([]);
    expect(reloadPage).toHaveBeenCalledOnce();
  });

  it('keeps unreadable data available when its download fails', () => {
    vi.mocked(downloadLocalStorageRecovery).mockImplementationOnce(() => {
      throw new Error('Download unavailable');
    });
    reportLocalStorageReadIssue({
      label: 'Prompt templates',
      rawValue: '{not-json',
      reason: 'invalid-json',
      storageKey: 'templates',
    });

    render(
      <BrowserStorageNotice
        storage={{
          getItem() {
            return null;
          },
          setItem() {},
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Download unreadable data' }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The unreadable browser data could not be downloaded. It has not been removed.',
    );
    expect(getLocalStorageReadIssues()).toHaveLength(1);
  });

  it('keeps unreadable data available when reset fails', () => {
    const reloadPage = vi.fn();
    const removeItem = vi.fn(() => {
      throw new Error('Storage unavailable');
    });

    reportLocalStorageReadIssue({
      label: 'Prompt templates',
      rawValue: '{not-json',
      reason: 'invalid-json',
      storageKey: 'templates',
    });

    render(
      <BrowserStorageNotice
        reloadPage={reloadPage}
        storage={{
          getItem() {
            return '{not-json';
          },
          removeItem,
          setItem() {},
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset affected data' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reset and reload' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The unreadable browser data could not be fully reset. It remains available for download in this session.',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getLocalStorageReadIssues()).toHaveLength(1);
    expect(reloadPage).not.toHaveBeenCalled();
  });

  it('leaves storage unchanged when reset is cancelled', () => {
    const reloadPage = vi.fn();
    const removeItem = vi.fn();

    reportLocalStorageReadIssue({
      label: 'Prompt templates',
      rawValue: '{not-json',
      reason: 'invalid-json',
      storageKey: 'templates',
    });

    render(
      <BrowserStorageNotice
        reloadPage={reloadPage}
        storage={{
          getItem() {
            return '{not-json';
          },
          removeItem,
          setItem() {},
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset affected data' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Keep current data' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(removeItem).not.toHaveBeenCalled();
    expect(getLocalStorageReadIssues()).toHaveLength(1);
    expect(reloadPage).not.toHaveBeenCalled();
  });
});
