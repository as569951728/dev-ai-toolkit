import { describe, expect, it } from 'vitest';

import {
  CURRENT_LOCAL_STORAGE_SCHEMA_VERSION,
  readVersionedCollection,
  writeVersionedCollection,
} from '@/lib/local-storage-schema';

describe('local-storage-schema', () => {
  it('reads legacy array payloads', () => {
    expect(readVersionedCollection<string>(['template-1'])).toEqual([
      'template-1',
    ]);
  });

  it('reads current versioned collection payloads', () => {
    expect(
      readVersionedCollection<string>({
        version: CURRENT_LOCAL_STORAGE_SCHEMA_VERSION,
        data: ['template-1', 'template-2'],
      }),
    ).toEqual(['template-1', 'template-2']);
  });

  it('rejects unsupported or malformed collection payloads', () => {
    expect(
      readVersionedCollection<string>({
        version: CURRENT_LOCAL_STORAGE_SCHEMA_VERSION + 1,
        data: ['template-1'],
      }),
    ).toBeNull();
    expect(
      readVersionedCollection<string>({
        version: CURRENT_LOCAL_STORAGE_SCHEMA_VERSION,
        data: { id: 'template-1' },
      }),
    ).toBeNull();
    expect(readVersionedCollection<string>(null)).toBeNull();
  });

  it('writes the current versioned collection payload shape', () => {
    expect(writeVersionedCollection(['template-1'])).toEqual({
      version: CURRENT_LOCAL_STORAGE_SCHEMA_VERSION,
      data: ['template-1'],
    });
  });
});
