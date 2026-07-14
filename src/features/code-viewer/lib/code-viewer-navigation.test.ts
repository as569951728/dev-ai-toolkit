import { describe, expect, it } from 'vitest';

import {
  createCodeViewerNavigationState,
  readCodeViewerNavigationState,
} from '@/features/code-viewer/lib/code-viewer-navigation';

describe('code-viewer-navigation', () => {
  it('round trips a code comparison through router state', () => {
    const state = createCodeViewerNavigationState({
      left: 'Original prompt',
      right: 'Rendered prompt',
      mode: 'compare',
      language: 'markdown',
    });

    expect(readCodeViewerNavigationState(state)).toEqual({
      left: 'Original prompt',
      right: 'Rendered prompt',
      mode: 'compare',
      language: 'markdown',
    });
  });

  it('ignores unrelated or malformed router state', () => {
    expect(readCodeViewerNavigationState(null)).toBeNull();
    expect(readCodeViewerNavigationState({ codeViewer: 'invalid' })).toBeNull();
    expect(
      readCodeViewerNavigationState({
        codeViewer: {
          left: 'Original prompt',
          right: 'Rendered prompt',
          mode: 'side-by-side',
          language: 'markdown',
        },
      }),
    ).toBeNull();
    expect(
      readCodeViewerNavigationState({
        codeViewer: {
          left: 'Original prompt',
          right: 42,
          mode: 'compare',
          language: 'markdown',
        },
      }),
    ).toBeNull();
  });
});
