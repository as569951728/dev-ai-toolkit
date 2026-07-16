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

export function getLineChanges(left: string[], right: string[]) {
  const lcsLengths = Array.from(
    { length: left.length + 1 },
    () => new Uint32Array(right.length + 1),
  );

  for (let leftIndex = left.length - 1; leftIndex >= 0; leftIndex -= 1) {
    const currentRow = lcsLengths[leftIndex]!;
    const nextRow = lcsLengths[leftIndex + 1]!;

    for (
      let rightIndex = right.length - 1;
      rightIndex >= 0;
      rightIndex -= 1
    ) {
      currentRow[rightIndex] =
        left[leftIndex] === right[rightIndex]
          ? (nextRow[rightIndex + 1] ?? 0) + 1
          : Math.max(
              nextRow[rightIndex] ?? 0,
              currentRow[rightIndex + 1] ?? 0,
            );
    }
  }

  const added: string[] = [];
  const removed: string[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }

    const removeScore = lcsLengths[leftIndex + 1]![rightIndex] ?? 0;
    const addScore = lcsLengths[leftIndex]![rightIndex + 1] ?? 0;

    if (removeScore >= addScore) {
      removed.push(left[leftIndex]!);
      leftIndex += 1;
    } else {
      added.push(right[rightIndex]!);
      rightIndex += 1;
    }
  }

  removed.push(...left.slice(leftIndex));
  added.push(...right.slice(rightIndex));

  return { added, removed };
}
