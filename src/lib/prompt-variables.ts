function createPromptVariablePattern() {
  return /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
}

export function extractPromptVariableKeys(...sources: string[]) {
  const keys = new Set<string>();

  for (const source of sources) {
    for (const match of source.matchAll(createPromptVariablePattern())) {
      const key = match[1]?.trim();

      if (key) {
        keys.add(key);
      }
    }
  }

  return [...keys];
}

export function replacePromptVariablePlaceholders(
  source: string,
  getReplacement: (key: string) => string,
) {
  return source.replaceAll(
    createPromptVariablePattern(),
    (_, rawKey: string) => getReplacement(rawKey.trim()),
  );
}
