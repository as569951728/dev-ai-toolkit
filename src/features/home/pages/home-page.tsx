import { Link } from 'react-router-dom';

import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

const moduleGroups = [
  {
    title: 'Prompt Workflows',
    description:
      'Create reusable prompt assets, turn them into task-ready instructions, and inspect revisions before sharing them.',
    cards: [
      {
        title: 'Prompt Templates',
        description:
          'Create, organize, search, duplicate, and share reusable prompt assets for repeat engineering workflows.',
        href: '/prompts',
        meta: 'Manage template inventory',
      },
      {
        title: 'Prompt Playground',
        description:
          'Take a template, fill variables, preview the final output, and copy production-ready prompts into your AI workflow.',
        href: '/playground',
        meta: 'Turn templates into output',
      },
      {
        title: 'Prompt Diff',
        description:
          'Compare prompt revisions, spot variable drift, and inspect wording changes before templates spread across the team.',
        href: '/prompt-diff',
        meta: 'Review prompt revisions',
      },
    ],
  },
  {
    title: 'Developer Utilities',
    description:
      'Inspect JSON payloads, draft API requests, and review generated output without leaving the same toolbox.',
    cards: [
      {
        title: 'JSON Tools',
        description:
          'Format, validate, minify, and clean JSON payloads for fast debugging and AI-related developer tasks.',
        href: '/json-tools',
        meta: 'Inspect structured data',
      },
      {
        title: 'API Builder',
        description:
          'Compose request URLs, headers, query params, and payloads, then generate a ready-to-use fetch snippet.',
        href: '/api-builder',
        meta: 'Draft request configurations',
      },
      {
        title: 'Code Output Viewer',
        description:
          'Inspect code, text output, or generated responses in single or compare mode with line-aware reading.',
        href: '/code-viewer',
        meta: 'Review generated output',
      },
    ],
  },
];

const valuePoints = [
  'Keep repeat AI development tasks in one local-first workspace instead of scattering them across tabs and chats.',
  'Turn prompts, request scaffolds, payload checks, and output reviews into reusable workflows.',
  'Create a toolbox that is practical today and extensible toward shared team knowledge tomorrow.',
];

const workflowSteps = [
  {
    step: '01',
    title: 'Start from a workflow module',
    description:
      'Choose the part of your task you want to move faster, from prompt authoring to payload checks and output review.',
  },
  {
    step: '02',
    title: 'Prepare the task-specific details',
    description:
      'Fill prompt variables, compose request data, or clean structured payloads depending on the workflow.',
  },
  {
    step: '03',
    title: 'Review the result and continue the job',
    description:
      'Inspect the generated output, compare revisions, and move the result into the next step of your development workflow.',
  },
];

const useCases = [
  'Code review preparation',
  'API design assistance',
  'Bug triage and debugging',
  'Team prompt standardization',
  'JSON payload validation',
  'Request scaffolding for frontend and backend work',
  'Comparing generated code or rewritten output',
  'Checking prompt revisions before sharing a template',
];

const roadmapPhases = [
  {
    phase: 'Stage 1',
    title: 'Toolbox framing',
    summary: 'Make the product read clearly as a multi-workflow AI developer toolbox.',
  },
  {
    phase: 'Stage 2',
    title: 'Workflow connections',
    summary:
      'Connect prompt, payload, and output modules so they feel like one system.',
  },
  {
    phase: 'Stage 3',
    title: 'Shared knowledge layers',
    summary:
      'Prepare the data model and product direction for reusable team workflows.',
  },
];

export function HomePage() {
  const { templates } = usePromptTemplates();

  return (
    <section className="home-layout">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="eyebrow">Open Source AI Developer Toolbox</p>
          <h1>One toolbox for prompt workflows, payload work, and output review.</h1>
          <p className="home-hero__summary">
            dev-ai-toolkit helps developers manage prompts, inspect payloads,
            draft API requests, and review generated output in a local-first
            toolbox built for repeat engineering work.
          </p>

          <div className="home-hero__actions">
            <Link className="primary-button" to="/prompts">
              Explore prompt workflows
            </Link>
            <Link className="secondary-button" to="/json-tools">
              Open developer utilities
            </Link>
          </div>
        </div>

        <aside className="home-hero__stats">
          <div className="metric-card">
            <span className="metric-card__label">Reusable templates</span>
            <strong>{templates.length}</strong>
            <p>Ready to preview, duplicate, import, and export.</p>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Toolbox coverage</span>
            <strong>Prompts to Payloads to Output</strong>
            <p>Six local-first modules for common AI-assisted developer work.</p>
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Why it matters</p>
          <h2>Designed for repeat developer workflows, not one-off AI sessions.</h2>
        </div>

        <div className="value-grid">
          {valuePoints.map((point) => (
            <article className="value-card" key={point}>
              <p>{point}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Current modules</p>
          <h2>Organized as prompt workflows plus developer utilities.</h2>
        </div>

        {moduleGroups.map((group) => (
          <section className="home-module-group" key={group.title}>
            <div className="home-module-group__header">
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </div>

            <div className="module-grid">
              {group.cards.map((card) => (
                <article className="module-card" key={card.title}>
                  <span className="module-card__meta">{card.meta}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <Link className="ghost-button" to={card.href}>
                    Explore module
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">How it works</p>
          <h2>Move from raw task input to cleaner AI-assisted output in three steps.</h2>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((item) => (
            <article className="workflow-card" key={item.step}>
              <span className="workflow-card__step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--accent">
        <div className="home-section__heading">
          <p className="eyebrow">Who it helps</p>
          <h2>Built for developers who repeat AI-assisted engineering tasks every week.</h2>
        </div>

        <div className="use-case-list" aria-label="Common use cases">
          {useCases.map((useCase) => (
            <span className="use-case-pill" key={useCase}>
              {useCase}
            </span>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Roadmap rhythm</p>
          <h2>Shifting from prototype pages to a more connected toolbox.</h2>
        </div>

        <div className="roadmap-grid">
          {roadmapPhases.map((phase) => (
            <article className="roadmap-card" key={phase.phase}>
              <span className="roadmap-card__phase">{phase.phase}</span>
              <h3>{phase.title}</h3>
              <p>{phase.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
