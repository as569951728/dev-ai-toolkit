import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { writeClipboardText } from '@/lib/clipboard';

let originalClipboardDescriptor: PropertyDescriptor | undefined;

beforeEach(() => {
  originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'clipboard',
  );
});

afterEach(() => {
  if (originalClipboardDescriptor) {
    Object.defineProperty(
      navigator,
      'clipboard',
      originalClipboardDescriptor,
    );
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }

  vi.restoreAllMocks();
});

describe('writeClipboardText', () => {
  it('writes text through the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await writeClipboardText('copy me');

    expect(writeText).toHaveBeenCalledWith('copy me');
  });

  it('throws a stable error when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    await expect(writeClipboardText('copy me')).rejects.toThrow(
      'Clipboard API unavailable.',
    );
  });
});
