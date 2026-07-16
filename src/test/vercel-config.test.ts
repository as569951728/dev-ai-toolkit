import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

interface VercelHeader {
  key: string;
  value: string;
}

interface VercelConfig {
  headers?: Array<{
    source: string;
    headers: VercelHeader[];
  }>;
  rewrites?: Array<{
    source: string;
    destination: string;
  }>;
  routes?: unknown;
}

describe('Vercel deployment config', () => {
  it('applies the baseline browser security headers to every route', async () => {
    const configPath = path.join(process.cwd(), 'vercel.json');
    const config = JSON.parse(
      await readFile(configPath, 'utf8'),
    ) as VercelConfig;
    const routeHeaders = config.headers?.find(
      (headerRule) => headerRule.source === '/(.*)',
    );

    expect(Object.fromEntries(
      routeHeaders?.headers.map(({ key, value }) => [key, value]) ?? [],
    )).toEqual({
      'Content-Security-Policy':
        "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'",
      'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    });
    expect(config.routes).toBeUndefined();
    expect(config.rewrites).toEqual([
      {
        source: '/(.*)',
        destination: '/index.html',
      },
    ]);
  });
});
