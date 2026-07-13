import { describe, expect, it } from 'vitest';

import {
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
});
