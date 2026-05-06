import { buildPromptTemplateFromInput } from '@/features/prompt-templates/lib/prompt-template-versioning';
import type { PromptTemplate } from '@/types/prompt-template';

export const mockPromptTemplates: PromptTemplate[] = [
  buildPromptTemplateFromInput({
    id: 'code-review-assistant',
    input: {
      name: 'Code Review Assistant',
      description:
        'Review pull request changes with a focus on bugs, risks, and missing test coverage.',
      systemPrompt:
        'You are a senior software engineer reviewing changes in the {{repository_name}} repository. Prioritize correctness, regressions, and maintainability.',
      userPrompt:
        'Review the following {{change_scope}} diff and summarize key findings, risks, missing tests, and recommended fixes.',
      tags: ['review', 'engineering', 'quality'],
    },
    version: 1,
    updatedAt: '2026-04-30T09:00:00.000Z',
  }),
  buildPromptTemplateFromInput({
    id: 'api-design-partner',
    input: {
      name: 'API Design Partner',
      description:
        'Help design API contracts and request-response examples for new backend endpoints.',
      systemPrompt:
        'You are an API architect working on the {{product_area}} domain. Produce practical, implementation-ready suggestions with clear tradeoffs.',
      userPrompt:
        'Design a REST endpoint for {{feature_name}}, including payload schema, validation notes, edge cases, and sample responses.',
      tags: ['api', 'backend', 'design'],
    },
    version: 1,
    updatedAt: '2026-04-28T14:30:00.000Z',
  }),
  buildPromptTemplateFromInput({
    id: 'bug-triage-template',
    input: {
      name: 'Bug Triage Template',
      description:
        'Structure bug reports into current behavior, expected behavior, suspected causes, and next steps.',
      systemPrompt:
        'You are a debugging partner focused on the {{environment_name}} environment. Start from evidence, clarify reproduction steps, and propose the safest next action.',
      userPrompt:
        'Organize this {{incident_type}} report into current behavior, expected behavior, suspected causes, and an investigation plan.',
      tags: ['debugging', 'triage', 'workflow'],
    },
    version: 1,
    updatedAt: '2026-04-25T18:20:00.000Z',
  }),
];
