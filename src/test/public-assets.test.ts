import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('public assets', () => {
  it('serves robots directives instead of the SPA fallback', async () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');

    await expect(readFile(robotsPath, 'utf8')).resolves.toBe(
      'User-agent: *\nAllow: /\n',
    );
  });
});
