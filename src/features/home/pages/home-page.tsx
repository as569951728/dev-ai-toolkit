import { Link } from 'react-router-dom';

import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

const moduleCards = [
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
];

const valuePoints = [
  'Reduce repeated prompt writing across debugging, review, and API design tasks.',
  'Turn scattered AI habits into reusable assets that can survive beyond chat history.',
  'Create a local-first workspace that is simple today and extensible tomorrow.',
];

const workflowSteps = [
  {
    step: '01',
    title: 'Pick a reusable template',
    description:
      'Start from a prompt asset instead of rewriting the same instructions from scratch.',
  },
  {
    step: '02',
    title: 'Fill variables for the current task',
    description:
      'Use placeholders like repository name, feature scope, or incident type to adapt prompts quickly.',
  },
  {
    step: '03',
    title: 'Preview and move into your AI workflow',
    description:
      'Review the final system and user prompts, then copy them into the tool you already use.',
  },
];

const useCases = [
  'Code review preparation',
  'API design assistance',
  'Bug triage and debugging',
  'Team prompt standardization',
];

const roadmapPhases = [
  {
    phase: 'Stage 1',
    title: 'Product foundation',
    summary: 'Make the tool clearly useful for solo developers and early adopters.',
  },
  {
    phase: 'Stage 2',
    title: 'AI developer toolbox',
    summary:
      'Expand beyond prompts into JSON, API, and output-focused utilities.',
  },
  {
    phase: 'Stage 3',
    title: 'Team knowledge capture',
    summary:
      'Move from individual workflows toward reusable shared prompt assets.',
  },
];

export function HomePage() {
  const { templates } = usePromptTemplates();

  return (
    <section className="home-layout">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="eyebrow">Open Source AI Workspace</p>
          <h1>Build repeatable AI workflows for real developer work.</h1>
          <p className="home-hero__summary">
            dev-ai-toolkit helps developers structure prompt workflows,
            preserve reusable AI patterns, and grow toward a real AI workbench
            instead of a pile of one-off chats.
          </p>

          <div className="home-hero__actions">
            <Link className="primary-button" to="/playground">
              Open playground
            </Link>
            <Link className="secondary-button" to="/prompts">
              Browse templates
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
            <span className="metric-card__label">Current workflow</span>
            <strong>Template to Variables to Prompt</strong>
            <p>A complete local-first loop for repeat AI usage.</p>
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Why it matters</p>
          <h2>Designed for repeat developer workflows, not one-off prompts.</h2>
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
          <h2>Two focused modules, one clear workflow.</h2>
        </div>

        <div className="module-grid">
          {moduleCards.map((card) => (
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

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">How it works</p>
          <h2>Move from reusable prompts to ready-to-run output in three steps.</h2>
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
          <h2>Built for developers who repeat the same AI tasks more than once.</h2>
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
          <h2>Growing toward a broader AI developer toolbox.</h2>
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
