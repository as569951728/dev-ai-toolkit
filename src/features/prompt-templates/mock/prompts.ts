import type { PromptTemplate } from '@/types/prompt-template';

export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'code-review-assistant',
    name: 'Code Review Assistant',
    description: 'Review pull request changes with a focus on bugs, risks, and missing test coverage.',
    systemPrompt:
      'You are a senior software engineer performing a careful code review. Prioritize correctness, regressions, and maintainability.',
    userPrompt:
      'Review the following code diff and summarize key findings, risks, and recommended fixes.',
    tags: ['review', 'engineering', 'quality'],
    updatedAt: '2026-04-30T09:00:00.000Z',
  },
  {
    id: 'api-design-partner',
    name: 'API Design Partner',
    description: 'Help design API contracts and request-response examples for new backend endpoints.',
    systemPrompt:
      'You are an API architect. Produce practical, implementation-ready suggestions with clear tradeoffs.',
    userPrompt:
      'Design a REST endpoint for the described feature, including payload schema, validation notes, and sample responses.',
    tags: ['api', 'backend', 'design'],
    updatedAt: '2026-04-28T14:30:00.000Z',
  },
  {
    id: 'bug-triage-template',
    name: 'Bug Triage Template',
    description: 'Structure bug reports into current behavior, expected behavior, suspected causes, and next steps.',
    systemPrompt:
      'You are a debugging partner. Start from evidence, clarify reproduction steps, and propose the safest next action.',
    userPrompt:
      'Organize this bug report into a triage summary and propose an investigation plan.',
    tags: ['debugging', 'triage', 'workflow'],
    updatedAt: '2026-04-25T18:20:00.000Z',
  },
];
