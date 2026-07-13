import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BrowserStorageNotice } from '@/components/layout/browser-storage-notice';

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
});
