import { describe, expect, it, vi } from 'vitest';

import {
  canUseBrowserStorage,
  resolveBrowserStorage,
  type StorageLike,
} from '@/lib/browser-storage';

describe('browser-storage', () => {
  it('returns null when no browser host exists', () => {
    expect(resolveBrowserStorage(null)).toBeNull();
  });

  it('returns the storage exposed by the browser host', () => {
    const storage = {
      getItem() {
        return null;
      },
      setItem() {},
    };

    expect(resolveBrowserStorage({ localStorage: storage })).toBe(storage);
  });

  it('returns a failing storage adapter when property access is blocked', () => {
    const storage = resolveBrowserStorage({
      get localStorage(): StorageLike {
        throw new DOMException('Access denied.', 'SecurityError');
      },
    });

    expect(() => storage?.getItem('templates')).toThrow(
      'Browser storage is unavailable.',
    );
    expect(() => storage?.setItem('templates', '[]')).toThrow(
      'Browser storage is unavailable.',
    );
  });

  it('reports when browser storage can be read and written', () => {
    const setItem = vi.fn();
    const removeItem = vi.fn();

    expect(
      canUseBrowserStorage({
        getItem() {
          return null;
        },
        setItem,
        removeItem,
      }),
    ).toBe(true);
    expect(setItem).toHaveBeenCalledWith(
      'dev-ai-toolkit.storage-health-check',
      'available',
    );
    expect(removeItem).toHaveBeenCalledWith(
      'dev-ai-toolkit.storage-health-check',
    );
  });

  it('reports when browser storage reads or writes are blocked', () => {
    expect(
      canUseBrowserStorage({
        getItem() {
          throw new DOMException('Access denied.', 'SecurityError');
        },
        setItem() {},
      }),
    ).toBe(false);
    expect(
      canUseBrowserStorage({
        getItem() {
          return null;
        },
        setItem() {
          throw new DOMException('Quota exceeded.', 'QuotaExceededError');
        },
      }),
    ).toBe(false);
    expect(canUseBrowserStorage(null)).toBe(false);
  });
});
