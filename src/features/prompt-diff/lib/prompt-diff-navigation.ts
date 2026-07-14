interface PromptDiffValues {
  left: string;
  right: string;
}

interface PromptDiffNavigationState {
  promptDiff: PromptDiffValues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createPromptDiffNavigationState(
  values: PromptDiffValues,
): PromptDiffNavigationState {
  return { promptDiff: values };
}

export function readPromptDiffNavigationState(
  state: unknown,
): PromptDiffValues | null {
  if (!isRecord(state) || !isRecord(state.promptDiff)) {
    return null;
  }

  const { left, right } = state.promptDiff;

  return typeof left === 'string' && typeof right === 'string'
    ? { left, right }
    : null;
}
