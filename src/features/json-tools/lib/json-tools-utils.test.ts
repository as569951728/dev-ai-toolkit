import { describe, expect, it } from 'vitest';

import {
  buildJsonErrorMessage,
  countCharacters,
  countLines,
  formatJson,
  minifyJson,
  validateJson,
} from '@/features/json-tools/lib/json-tools-utils';

describe('json-tools-utils', () => {
  it('formats valid JSON with readable indentation', () => {
    expect(formatJson('{"name":"dev-ai-toolkit"}')).toEqual({
      content: '{\n  "name": "dev-ai-toolkit"\n}',
      isValid: true,
      message: 'JSON formatted successfully.',
    });
  });

  it('minifies valid JSON', () => {
    expect(minifyJson('{\n  "name": "dev-ai-toolkit"\n}')).toEqual({
      content: '{"name":"dev-ai-toolkit"}',
      isValid: true,
      message: 'JSON minified successfully.',
    });
  });

  it('validates JSON and returns the normalized content', () => {
    expect(validateJson('{"enabled":true}')).toEqual({
      content: '{\n  "enabled": true\n}',
      isValid: true,
      message: 'Valid JSON.',
    });
  });

  it('builds useful JSON error messages', () => {
    expect(buildJsonErrorMessage(new Error('Unexpected token'))).toBe(
      'Unexpected token',
    );
    expect(buildJsonErrorMessage('not an error')).toBe('Invalid JSON input.');
  });

  it('counts JSON editor lines and characters', () => {
    expect(countLines('')).toBe(0);
    expect(countLines('{\n  "name": "dev-ai-toolkit"\n}')).toBe(3);
    expect(countCharacters('abc')).toBe(3);
  });
});
