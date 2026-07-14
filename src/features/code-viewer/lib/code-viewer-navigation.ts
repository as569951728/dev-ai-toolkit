import {
  codeViewerLanguageOptions,
  type CodeViewerLanguage,
  type CodeViewerMode,
} from '@/features/code-viewer/lib/code-viewer-utils';

interface CodeViewerNavigationValues {
  left: string;
  right: string;
  mode: CodeViewerMode;
  language: CodeViewerLanguage;
}

interface CodeViewerNavigationState {
  codeViewer: CodeViewerNavigationValues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createCodeViewerNavigationState(
  values: CodeViewerNavigationValues,
): CodeViewerNavigationState {
  return { codeViewer: values };
}

export function readCodeViewerNavigationState(
  state: unknown,
): CodeViewerNavigationValues | null {
  if (!isRecord(state) || !isRecord(state.codeViewer)) {
    return null;
  }

  const { language, left, mode, right } = state.codeViewer;

  if (
    typeof left !== 'string' ||
    typeof right !== 'string' ||
    (mode !== 'single' && mode !== 'compare') ||
    !codeViewerLanguageOptions.includes(language as CodeViewerLanguage)
  ) {
    return null;
  }

  return {
    left,
    right,
    mode,
    language: language as CodeViewerLanguage,
  };
}
