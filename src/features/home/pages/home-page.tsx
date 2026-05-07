import { Link } from 'react-router-dom';

import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

const moduleGroups = [
  {
    title: 'Prompt Workflows',
    description:
      'Manage reusable prompts, run them with variables, and compare changes when the wording evolves.',
    cards: [
      {
        title: 'Prompt Templates',
        description:
          'Create, organize, search, and reuse prompt templates for recurring development tasks.',
        href: '/prompts',
        meta: 'Manage template inventory',
      },
      {
        title: 'Prompt Playground',
        description:
          'Fill variables, preview the final prompt, and save a reusable output snapshot.',
        href: '/playground',
        meta: 'Turn templates into output',
      },
      {
        title: 'Prompt Diff',
        description:
          'Compare prompt revisions, check variable drift, and review wording changes.',
        href: '/prompt-diff',
        meta: 'Review prompt revisions',
      },
      {
        title: 'Run History',
        description:
          'Review saved prompt runs, trace them back to template versions, and reopen output later.',
        href: '/runs',
        meta: 'Browse saved prompt output',
      },
    ],
  },
  {
    title: 'Developer Utilities',
    description:
      'Handle JSON payloads, draft API requests, and inspect output alongside the prompt workflow.',
    cards: [
      {
        title: 'JSON Tools',
        description:
          'Format, validate, minify, and clean JSON payloads.',
        href: '/json-tools',
        meta: 'Inspect structured data',
      },
      {
        title: 'API Builder',
        description:
          'Compose request URLs, headers, query params, and payloads, then generate a fetch snippet.',
        href: '/api-builder',
        meta: 'Draft request configurations',
      },
      {
        title: 'Code Output Viewer',
        description:
          'Inspect code or text output in single or compare mode.',
        href: '/code-viewer',
        meta: 'Review generated output',
      },
    ],
  },
];

const valuePoints = [
  'Keep prompt templates, payload helpers, and output review in one local app.',
  'Make repeated prompt work easier to reuse and check over time.',
  'Stay lightweight while the project is still browser-only and local-first.',
];

const workflowSteps = [
  {
    step: '01',
    title: 'Start from a workflow module',
    description:
      'Start with the part of the job you are actually trying to finish.',
  },
  {
    step: '02',
    title: 'Prepare the task-specific details',
    description:
      'Fill prompt variables, compose request data, or clean structured payloads.',
  },
  {
    step: '03',
    title: 'Review the result and continue the job',
    description:
      'Review the output, compare revisions, and continue in the next tool when needed.',
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
  const { runs } = usePromptRuns();
  const recentRuns = runs.slice(0, 3);

  return (
    <section className="home-layout">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="eyebrow">Open Source Developer Tool</p>
          <h1>A local-first workspace for prompt work and small developer utilities.</h1>
          <p className="home-hero__summary">
            dev-ai-toolkit is a small React app for managing prompt templates,
            saving prompt runs, and handling adjacent tasks like JSON cleanup,
            request drafting, and output review.
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
            <p>A few connected modules for everyday prompt and debugging work.</p>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Saved prompt runs</span>
            <strong>{runs.length}</strong>
            <p>Recent outputs can now be captured as reusable local activity history.</p>
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Start here</p>
          <h2>Start with templates, then save and review prompt output.</h2>
        </div>

        <div className="workflow-grid">
          <article className="workflow-card">
            <span className="workflow-card__step">01</span>
            <h3>Choose or create a template</h3>
            <p>Start in Prompt Templates and keep the prompts you expect to reuse.</p>
            <Link className="ghost-button" to="/prompts">
              Open Prompt Templates
            </Link>
          </article>
          <article className="workflow-card">
            <span className="workflow-card__step">02</span>
            <h3>Run it in the playground</h3>
            <p>Fill variables and preview the final prompt before you save the run.</p>
            <Link className="ghost-button" to="/playground">
              Open Prompt Playground
            </Link>
          </article>
          <article className="workflow-card">
            <span className="workflow-card__step">03</span>
            <h3>Save the output trail</h3>
            <p>Save a run snapshot, then come back to it from history when you need it again.</p>
            <Link className="ghost-button" to="/runs">
              Open Run History
            </Link>
          </article>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Why this app exists</p>
          <h2>Built for repeated prompt work, not just one-off chat sessions.</h2>
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
          <h2>The current app is split between prompt work and supporting utilities.</h2>
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
          <p className="eyebrow">Working pattern</p>
          <h2>The app stays simple: prepare input, review output, and keep useful history.</h2>
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
          <p className="eyebrow">Common use cases</p>
          <h2>These are the kinds of small development tasks the current app already supports.</h2>
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
          <p className="eyebrow">Recent activity</p>
          <h2>Saved runs are visible on the homepage so the project feels more like a working tool.</h2>
        </div>

        {recentRuns.length > 0 ? (
          <div className="module-grid">
            {recentRuns.map((run) => (
              <article className="module-card" key={run.id}>
                <span className="module-card__meta">Prompt Run</span>
                <h3>{run.templateName}</h3>
                <p>
                  Saved from template version v{run.templateVersion} with{' '}
                  {Object.keys(run.variables).length} captured variables.
                </p>
                <Link className="ghost-button" to={`/prompts/${run.templateId}`}>
                  Open template history
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <h2>No activity yet</h2>
            <p>Save a run in the playground and it will appear here as part of the toolbox history.</p>
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Current direction</p>
          <h2>The focus is still on connecting the existing modules before adding many more.</h2>
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
