import { Link } from 'react-router-dom';

import { useLocalization } from '@/features/localization/localization-context';
import type { TranslationKey } from '@/features/localization/translations';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { buildPromptRunDetailPath } from '@/features/prompt-runs/lib/prompt-run-links';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import {
  buildPromptTemplateCreatePath,
  buildPromptTemplatePlaygroundPath,
  createPromptTemplateCreateNavigationState,
} from '@/features/prompt-templates/lib/prompt-template-links';

interface HomeModuleCard {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  href: string;
  metaKey: TranslationKey;
}

interface HomeModuleGroup {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  cards: HomeModuleCard[];
}

const moduleGroups: HomeModuleGroup[] = [
  {
    titleKey: 'home.modules.prompts.title',
    descriptionKey: 'home.modules.prompts.description',
    cards: [
      {
        titleKey: 'navigation.templates',
        descriptionKey: 'home.module.templates.description',
        href: '/prompts',
        metaKey: 'home.module.templates.meta',
      },
      {
        titleKey: 'navigation.playground',
        descriptionKey: 'home.module.playground.description',
        href: '/playground',
        metaKey: 'home.module.playground.meta',
      },
      {
        titleKey: 'navigation.diff',
        descriptionKey: 'home.module.diff.description',
        href: '/prompt-diff',
        metaKey: 'home.module.diff.meta',
      },
      {
        titleKey: 'navigation.runs',
        descriptionKey: 'home.module.runs.description',
        href: '/runs',
        metaKey: 'home.module.runs.meta',
      },
    ],
  },
  {
    titleKey: 'home.modules.utilities.title',
    descriptionKey: 'home.modules.utilities.description',
    cards: [
      {
        titleKey: 'navigation.json',
        descriptionKey: 'home.module.json.description',
        href: '/json-tools',
        metaKey: 'home.module.json.meta',
      },
      {
        titleKey: 'navigation.api',
        descriptionKey: 'home.module.api.description',
        href: '/api-builder',
        metaKey: 'home.module.api.meta',
      },
      {
        titleKey: 'home.module.code.title',
        descriptionKey: 'home.module.code.description',
        href: '/code-viewer',
        metaKey: 'home.module.code.meta',
      },
    ],
  },
];

export function HomePage() {
  const { t } = useLocalization();
  const { templates } = usePromptTemplates();
  const { runs } = usePromptRuns();
  const recentRuns = runs.slice(0, 3);
  const activeTemplates = templates.filter((template) => !template.archivedAt);
  const firstActiveTemplate = activeTemplates[0];
  const primaryAction = firstActiveTemplate
    ? {
        href: buildPromptTemplatePlaygroundPath(firstActiveTemplate.id),
        label: t('home.primary.openTemplate', { name: firstActiveTemplate.name }),
        state: undefined,
      }
    : {
        href: buildPromptTemplateCreatePath(),
        label: t('home.primary.createTemplate'),
        state: createPromptTemplateCreateNavigationState(),
      };

  return (
    <section className="home-layout">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="eyebrow">{t('home.hero.eyebrow')}</p>
          <h1>{t('home.hero.title')}</h1>
          <p className="home-hero__summary">{t('home.hero.summary')}</p>

          <div className="home-hero__actions">
            <Link
              className="primary-button"
              state={primaryAction.state}
              to={primaryAction.href}
            >
              {primaryAction.label}
            </Link>
            <Link className="secondary-button" to="/prompts">
              {t('home.primary.manageTemplates')}
            </Link>
          </div>
        </div>

        <aside className="home-hero__stats">
          <div className="metric-card">
            <span className="metric-card__label">{t('home.metric.active')}</span>
            <strong>{activeTemplates.length}</strong>
            <p>{t('home.metric.activeDescription')}</p>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">{t('home.metric.workflow')}</span>
            <strong>{t('home.metric.workflowValue')}</strong>
            <p>{t('home.metric.workflowDescription')}</p>
          </div>
          <div className="metric-card">
            <span className="metric-card__label">{t('home.metric.runs')}</span>
            <strong>{runs.length}</strong>
            <p>{t('home.metric.runsDescription')}</p>
          </div>
        </aside>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">{t('home.start.eyebrow')}</p>
          <h2>{t('home.start.title')}</h2>
        </div>

        <div className="workflow-grid">
          <article className="workflow-card">
            <span className="workflow-card__step">01</span>
            <h3>{t('home.start.templateTitle')}</h3>
            <p>{t('home.start.templateDescription')}</p>
            <Link className="ghost-button" to="/prompts">
              {t('home.start.templateAction')}
            </Link>
          </article>
          <article className="workflow-card">
            <span className="workflow-card__step">02</span>
            <h3>{t('home.start.playgroundTitle')}</h3>
            <p>{t('home.start.playgroundDescription')}</p>
            <Link className="ghost-button" to="/playground">
              {t('home.start.playgroundAction')}
            </Link>
          </article>
          <article className="workflow-card">
            <span className="workflow-card__step">03</span>
            <h3>{t('home.start.snapshotTitle')}</h3>
            <p>{t('home.start.snapshotDescription')}</p>
            <Link className="ghost-button" to="/runs">
              {t('home.start.snapshotAction')}
            </Link>
          </article>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">{t('home.modules.eyebrow')}</p>
          <h2>{t('home.modules.title')}</h2>
        </div>

        {moduleGroups.map((group) => (
          <section className="home-module-group" key={group.titleKey}>
            <div className="home-module-group__header">
              <h3>{t(group.titleKey)}</h3>
              <p>{t(group.descriptionKey)}</p>
            </div>

            <div className="module-grid">
              {group.cards.map((card) => (
                <article className="module-card" key={card.titleKey}>
                  <span className="module-card__meta">{t(card.metaKey)}</span>
                  <h3>{t(card.titleKey)}</h3>
                  <p>{t(card.descriptionKey)}</p>
                  <Link className="ghost-button" to={card.href}>
                    {t('home.module.action')}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <p className="eyebrow">{t('home.activity.eyebrow')}</p>
          <h2>{t('home.activity.title')}</h2>
        </div>

        {recentRuns.length > 0 ? (
          <div className="module-grid">
            {recentRuns.map((run) => {
              const variableCount = Object.keys(run.variables).length;

              return (
                <article className="module-card" key={run.id}>
                  <span className="module-card__meta">
                    {t('home.activity.runMeta')}
                  </span>
                  <h3>{run.templateName}</h3>
                  <p>
                    {t(
                      variableCount === 1
                        ? 'home.activity.runDescription.one'
                        : 'home.activity.runDescription.other',
                      { count: variableCount, version: run.templateVersion },
                    )}
                  </p>
                  <Link
                    className="ghost-button"
                    to={buildPromptRunDetailPath(run.id)}
                  >
                    {t('home.activity.open')}
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state empty-state--compact">
            <h2>{t('home.activity.emptyTitle')}</h2>
            <p>{t('home.activity.emptyDescription')}</p>
          </div>
        )}
      </section>

    </section>
  );
}
