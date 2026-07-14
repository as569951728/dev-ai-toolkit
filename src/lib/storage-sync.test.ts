import { afterEach, describe, expect, it, vi } from 'vitest';

import { subscribeToStorageKey } from '@/lib/storage-sync';

describe('subscribeToStorageKey', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    for (const cleanup of cleanups.splice(0)) {
      cleanup();
    }
  });

  it('reports matching writes and storage clears from another tab', () => {
    const onStorageChange = vi.fn();
    cleanups.push(
      subscribeToStorageKey('dev-ai-toolkit.prompt-templates', onStorageChange),
    );

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'dev-ai-toolkit.prompt-templates',
        storageArea: window.localStorage,
      }),
    );
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: null,
        storageArea: window.localStorage,
      }),
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'unrelated-key' }),
    );

    expect(onStorageChange).toHaveBeenCalledTimes(2);
  });

  it('stops reporting changes after unsubscribe', () => {
    const onStorageChange = vi.fn();
    const unsubscribe = subscribeToStorageKey(
      'dev-ai-toolkit.prompt-templates',
      onStorageChange,
    );

    unsubscribe();
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'dev-ai-toolkit.prompt-templates',
      }),
    );

    expect(onStorageChange).not.toHaveBeenCalled();
  });

  it('ignores matching keys from session storage', () => {
    const onStorageChange = vi.fn();
    cleanups.push(
      subscribeToStorageKey('dev-ai-toolkit.prompt-templates', onStorageChange),
    );

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'dev-ai-toolkit.prompt-templates',
        storageArea: window.sessionStorage,
      }),
    );
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: null,
        storageArea: window.sessionStorage,
      }),
    );

    expect(onStorageChange).not.toHaveBeenCalled();
  });
});
