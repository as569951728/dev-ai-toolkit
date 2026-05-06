export const promptDiffSampleLeft = `You are a senior frontend reviewer.

Review the pull request for {{repositoryName}}.
Focus on:
- correctness
- edge cases
- regression risks

Return the answer in Chinese.`;

export const promptDiffSampleRight = `You are a senior frontend reviewer with an emphasis on practical engineering tradeoffs.

Review the pull request for {{repositoryName}} in the {{moduleName}} module.
Focus on:
- correctness
- edge cases
- regression risks
- missing tests

Return the answer in Chinese with concise, ranked findings first.`;

const variablePattern = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}

export function countPromptCharacters(value: string) {
  return value.length;
}

export function countPromptLines(value: string) {
  if (!value) {
    return 0;
  }

  return value.split('\n').length;
}

export function extractPromptVariables(value: string) {
  const matches = [...value.matchAll(variablePattern)]
    .map((match) => match[1])
    .filter((match): match is string => Boolean(match));
  return uniqueValues(matches);
}

export function splitPromptLines(value: string) {
  if (!value) {
    return [];
  }

  return value.split('\n');
}

export function getAddedValues(left: string[], right: string[]) {
  const leftSet = new Set(left);
  return right.filter((value) => !leftSet.has(value));
}

export function getRemovedValues(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}
