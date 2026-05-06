import { useContext } from 'react';

import { PromptRunsContext } from '@/features/prompt-runs/providers/prompt-runs-context';

export function usePromptRuns() {
  const context = useContext(PromptRunsContext);

  if (!context) {
    throw new Error('usePromptRuns must be used within a PromptRunsProvider.');
  }

  return context;
}
