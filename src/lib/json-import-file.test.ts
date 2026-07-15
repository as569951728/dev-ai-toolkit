import { describe, expect, it, vi } from 'vitest';

import {
  MAX_JSON_IMPORT_BYTES,
  readJsonImportFile,
} from '@/lib/json-import-file';

describe('json-import-file', () => {
  it('reads a JSON file at the configured size limit', async () => {
    const text = vi.fn().mockResolvedValue('{"version":1}');

    await expect(
      readJsonImportFile({ size: MAX_JSON_IMPORT_BYTES, text }),
    ).resolves.toBe('{"version":1}');
    expect(text).toHaveBeenCalledOnce();
  });

  it('rejects an oversized file before reading its contents', async () => {
    const text = vi.fn().mockResolvedValue('{}');

    await expect(
      readJsonImportFile({ size: MAX_JSON_IMPORT_BYTES + 1, text }),
    ).rejects.toThrow(
      'The selected JSON file is larger than the 5 MB import limit.',
    );
    expect(text).not.toHaveBeenCalled();
  });
});
