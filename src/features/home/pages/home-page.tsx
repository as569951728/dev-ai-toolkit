import { Link } from 'react-router-dom';

import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { buildPromptRunDetailPath } from '@/features/prompt-runs/lib/prompt-run-links';
import {
  buildPromptTemplateCreatePath,
  buildPromptTemplatePlaygroundPath,
  createPromptTemplateCreateNavigationState,
} from '@/features/prompt-templates/lib/prompt-template-links';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';

const moduleGroups = [
  {
    title: 'Prompt Workflows',
    description:
      'Manage reusable templates, compose prompts with variables, and review saved snapshots over time.',
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
          'Fill variables, preview composed system and user prompts, and save a local snapshot.',
        href: '/playground',
        meta: 'Compose reusable prompts',
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
          'Review prompt snapshots, trace them to template versions, and reopen captured variables in the playground.',
        href: '/runs',
        meta: 'Browse prompt snapshots',
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
          'Compose request URLs, headers, query params, and payloads, then generate fetch snippets or cURL commands.',
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
  'Keep reusable prompt templates, captured variables, and review notes in one local workspace.',
  'Turn repeated prompt work into snapshots you can compare, reuse, and back up.',
  'Stay lightweight while the project is still browser-only and local-first.',
];

const workflowSteps = [
  {
    step: '01',
    title: 'Start from a prompt template',
    description:
      'Choose an existing template or create one for a repeated development task.',
  },
  {
    step: '02',
    title: 'Compose the prompt',
    description:
      'Fill the current template variables and review the composed system and user prompts.',
  },
  {
    step: '03',
    title: 'Review and reuse the snapshot',
    description:
      'Save a snapshot, add review context, or reopen its captured variables for the next iteration.',
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
    title: 'Prompt workflow foundation',
    summary:
      'Keep the template, playground, snapshot, and run review path clear and reliable.',
  },
  {
    phase: 'Stage 2',
    title: 'Review and data reliability',
    summary:
      'Improve snapshot review, local validation, backup safety, and browser-level coverage.',
  },
  {
    phase: 'Stage 3',
    title: 'Focused utility connections',
    summary:
      'Connect supporting utilities only where they make the prompt workflow easier to complete.',
  },
];

export function HomePage() {
  const { templates } = usePromptTemplates();
  const { runs } = usePromptRuns();
  const recentRuns = runs.slice(0, 3);
  const activeTemplates = templates.filter(
    (template) => !template.archivedAt,
  );
  const firstActiveTemplate = activeTemplates[0];
  const primaryAction = firstActiveTemplate
    ? {
        href: buildPromptTemplatePlaygroundPath(firstActiveTemplate.id),
        label: `Open ${firstActiveTemplate.name}`,
        state: undefined,
      }
    : {
        href: buildPromptTemplateCreatePath(),
        label: 'Create first template',
        state: createPromptTemplateCreateNavigationState(),
      };

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
            <Link
              className="primary-button"
              state={primaryAction.state}
              to={primaryAction.href}
            >
              {primaryAction.label}
            </Link>
            <Link className="secondary-button" to="/prompts">
              Manage prompt templates
            </Link>
          </div>
        </div>

        <aside className="home-hero__stats">
          <div className="metric-card">
            <span className="metric-card__label">Active templates</span>
            <strong>{activeTemplates.length}</strong>
            <p>Ready to preview, duplicate, import, and export.</p>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Core workflow</span>
            <strong>Template to Snapshot</strong>
            <p>Compose, save, review, and reuse prompts without a backend.</p>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">Saved prompt runs</span>
            <strong>{runs.length}</strong>
            <p>Snapshots stay available as reusable local activity history.</p>
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Start here</p>
          <h2>Start with templates, then compose and review prompt snapshots.</h2>
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
            <h3>Save a reviewable snapshot</h3>
            <p>
              Save the composed prompts, then return from history to review or
              reuse the captured variables.
            </p>
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
          <h2>
            The app stays simple: compose prompts, review snapshots, and keep
            useful context.
          </h2>
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
          <h2>Recent prompt snapshots stay visible when you return to the workspace.</h2>
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
                <Link
                  className="ghost-button"
                  to={buildPromptRunDetailPath(run.id)}
                >
                  Open run detail
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <h2>No activity yet</h2>
            <p>
              Save a prompt snapshot in the playground and it will appear here
              for later review.
            </p>
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">Current direction</p>
          <h2>
            The focus is improving the local prompt workflow before adding
            broader platform features.
          </h2>
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
