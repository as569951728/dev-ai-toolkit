import { useContext } from 'react';

import { PromptTemplatesContext } from '@/features/prompt-templates/providers/prompt-templates-context';

export function usePromptTemplates() {
  const context = useContext(PromptTemplatesContext);

  if (!context) {
    throw new Error(
      'usePromptTemplates must be used within a PromptTemplatesProvider.',
    );
  }

  return context;
}
