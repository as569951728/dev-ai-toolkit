import { extractPromptVariableKeys } from '@/lib/prompt-variables';

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
  return extractPromptVariableKeys(value);
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

function getUnmatchedOccurrences(values: string[], matchedValues: string[]) {
  const remainingMatches = new Map<string, number>();

  matchedValues.forEach((value) => {
    remainingMatches.set(value, (remainingMatches.get(value) ?? 0) + 1);
  });

  return values.filter((value) => {
    const matchCount = remainingMatches.get(value) ?? 0;

    if (matchCount === 0) {
      return true;
    }

    if (matchCount === 1) {
      remainingMatches.delete(value);
    } else {
      remainingMatches.set(value, matchCount - 1);
    }

    return false;
  });
}

export function getAddedOccurrences(left: string[], right: string[]) {
  return getUnmatchedOccurrences(right, left);
}

export function getRemovedOccurrences(left: string[], right: string[]) {
  return getUnmatchedOccurrences(left, right);
}
