export interface JsonToolResult {
  content: string;
  isValid: boolean;
  message: string;
}

export function formatJson(rawValue: string): JsonToolResult {
  const parsed = JSON.parse(rawValue);

  return {
    content: JSON.stringify(parsed, null, 2),
    isValid: true,
    message: 'JSON formatted successfully.',
  };
}

export function minifyJson(rawValue: string): JsonToolResult {
  const parsed = JSON.parse(rawValue);

  return {
    content: JSON.stringify(parsed),
    isValid: true,
    message: 'JSON minified successfully.',
  };
}

export function validateJson(rawValue: string): JsonToolResult {
  const parsed = JSON.parse(rawValue);

  return {
    content: JSON.stringify(parsed, null, 2),
    isValid: true,
    message: 'Valid JSON.',
  };
}

export function buildJsonErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Invalid JSON input.';
}

export function countLines(value: string) {
  return value.length === 0 ? 0 : value.split('\n').length;
}

export function countCharacters(value: string) {
  return value.length;
}

export const sampleJson = `{
  "repository": "dev-ai-toolkit",
  "module": "json-tools",
  "tags": ["format", "validate", "minify"],
  "meta": {
    "owner": "open-source",
    "status": "active",
    "notes": "Use this sample to try the JSON tools workflow."
  }
}`;
