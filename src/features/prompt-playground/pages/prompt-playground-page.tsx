import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { createCodeViewerNavigationState } from '@/features/code-viewer/lib/code-viewer-navigation';
import { createPromptDiffNavigationState } from '@/features/prompt-diff/lib/prompt-diff-navigation';
import { PromptPlaygroundPreview } from '@/features/prompt-playground/components/prompt-playground-preview';
import { PromptPlaygroundTemplatePicker } from '@/features/prompt-playground/components/prompt-playground-template-picker';
import { PromptPlaygroundVariableForm } from '@/features/prompt-playground/components/prompt-playground-variable-form';
import { usePromptPlayground } from '@/features/prompt-playground/hooks/use-prompt-playground';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { buildPromptRunDetailPath } from '@/features/prompt-runs/lib/prompt-run-links';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { formatPromptSections } from '@/lib/prompt-sections';
import type { PromptRunRecord } from '@/types/prompt-run';

type PromptPlaygroundWorkspaceProps = {
  initialTemplateId?: string;
  initialVariableValues?: Record<string, string>;
  loadNotice?: string;
  sourceRun?: PromptRunRecord;
};

type SaveStatus = {
  contextKey: string;
  message: string;
  runId: string | null;
  tone: 'success' | 'error';
};

function buildPreviewContextKey(
  templateId: string,
  templateVersion: number,
  systemPrompt: string,
  userPrompt: string,
) {
  return JSON.stringify({
    templateId,
    templateVersion,
    systemPrompt,
    userPrompt,
  });
}

function describeFallback(message: string, fallbackTemplateName?: string) {
  return `${message} ${
    fallbackTemplateName
      ? `Showing ${fallbackTemplateName} instead.`
      : 'No active prompt template is available.'
  }`;
}

function PromptPlaygroundWorkspace({
  initialTemplateId,
  initialVariableValues,
  loadNotice,
  sourceRun,
}: PromptPlaygroundWorkspaceProps) {
  const navigate = useNavigate();
  const { createRun, runs } = usePromptRuns();
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const {
    selectedTemplate,
    selectedTemplateId,
    templates,
    variables,
    variableValues,
    preview,
    recentTemplates,
    unresolvedVariables,
    markTemplateAsRecent,
    setSelectedTemplateId,
    updateVariableValue,
  } = usePromptPlayground(initialTemplateId, initialVariableValues);

  const originalPromptText = useMemo(() => {
    if (!selectedTemplate) {
      return '';
    }

    return formatPromptSections({
      systemPrompt: selectedTemplate.systemPrompt,
      userPrompt: selectedTemplate.userPrompt,
    });
  }, [selectedTemplate]);

  const generatedPromptText = useMemo(() => {
    if (!preview) {
      return '';
    }

    return formatPromptSections(preview);
  }, [preview]);

  const currentPreviewContextKey = useMemo(() => {
    if (!selectedTemplate || !preview) {
      return null;
    }

    return buildPreviewContextKey(
      selectedTemplate.id,
      selectedTemplate.version,
      preview.systemPrompt,
      preview.userPrompt,
    );
  }, [preview, selectedTemplate]);

  const savedRunIdFromStatus =
    saveStatus && saveStatus.contextKey === currentPreviewContextKey
      ? saveStatus.runId
      : null;
  const sourceRunMatchesPreview = Boolean(
    sourceRun &&
      selectedTemplate &&
      preview &&
      sourceRun.templateId === selectedTemplate.id &&
      sourceRun.templateVersion === selectedTemplate.version &&
      sourceRun.systemPrompt === preview.systemPrompt &&
      sourceRun.userPrompt === preview.userPrompt,
  );
  const matchingRunId =
    selectedTemplate && preview
      ? (runs.find(
          (run) =>
            run.templateId === selectedTemplate.id &&
            run.templateVersion === selectedTemplate.version &&
            run.systemPrompt === preview.systemPrompt &&
            run.userPrompt === preview.userPrompt,
        )?.id ?? null)
      : null;
  const savedRunId =
    matchingRunId ??
    (sourceRunMatchesPreview ? sourceRun?.id ?? null : savedRunIdFromStatus);
  const saveStatusMessage =
    saveStatus && saveStatus.contextKey === currentPreviewContextKey
      ? saveStatus.message
      : matchingRunId && !sourceRunMatchesPreview
        ? 'This prompt preview already has a saved snapshot.'
        : null;
  const saveStatusTone =
    saveStatus && saveStatus.contextKey === currentPreviewContextKey
      ? saveStatus.tone
      : null;

  return (
    <section className="playground-layout">
      <div className="playground-hero panel">
        <p className="eyebrow">Prompt Playground</p>
        <h1>Turn reusable templates into ready-to-run prompts</h1>
        <p className="panel__summary">
          Pick a template, fill in a few variables, and preview the final prompt
          output before you take it into your coding or debugging workflow.
        </p>
      </div>

      {loadNotice ? (
        <p className="status-banner status-banner--error" role="alert">
          {loadNotice}
        </p>
      ) : null}

      {sourceRun && selectedTemplate?.id === sourceRun.templateId ? (
        <p className="status-banner" role="status">
          Loaded captured variables from a{' '}
          <Link to={buildPromptRunDetailPath(sourceRun.id)}>
            saved prompt snapshot
          </Link>. Changes
          here will create a new snapshot and leave the original unchanged.
        </p>
      ) : null}

      <div className="playground-grid">
        <PromptPlaygroundTemplatePicker
          selectedTemplateId={selectedTemplateId}
          templates={templates}
          recentTemplates={recentTemplates}
          onTemplateChange={setSelectedTemplateId}
        />

        <PromptPlaygroundVariableForm
          selectedTemplate={selectedTemplate}
          variables={variables}
          values={variableValues}
          onValueChange={updateVariableValue}
        />

        <PromptPlaygroundPreview
          selectedTemplate={selectedTemplate}
          preview={preview}
          saveStatusMessage={saveStatusMessage}
          saveStatusTone={saveStatusTone}
          unresolvedVariables={unresolvedVariables}
          onSaveRun={() => {
            if (!selectedTemplate || !preview) {
              return;
            }

            const contextKey = buildPreviewContextKey(
              selectedTemplate.id,
              selectedTemplate.version,
              preview.systemPrompt,
              preview.userPrompt,
            );
            let savedRun;

            try {
              savedRun = createRun({
                templateId: selectedTemplate.id,
                templateName: selectedTemplate.name,
                templateVersion: selectedTemplate.version,
                variables: variableValues,
                systemPrompt: preview.systemPrompt,
                userPrompt: preview.userPrompt,
              });
            } catch {
              setSaveStatus({
                contextKey,
                message:
                  'Failed to save this prompt snapshot. Check that browser storage is available and try again.',
                runId: null,
                tone: 'error',
              });
              return;
            }

            markTemplateAsRecent(selectedTemplate.id);

            setSaveStatus({
              contextKey,
              message: `Saved a prompt snapshot for ${selectedTemplate.name} v${selectedTemplate.version}.`,
              runId: savedRun.id,
              tone: 'success',
            });
          }}
          onReviewInPromptDiff={() => {
            navigate('/prompt-diff', {
              state: createPromptDiffNavigationState({
                left: originalPromptText,
                right: generatedPromptText,
              }),
            });
          }}
          onOpenInCodeViewer={() => {
            navigate('/code-viewer', {
              state: createCodeViewerNavigationState({
                left: originalPromptText,
                right: generatedPromptText,
                mode: 'compare',
                language: 'markdown',
              }),
            });
          }}
          savedRunId={savedRunId}
        />
      </div>
    </section>
  );
}

export function PromptPlaygroundPage() {
  const [searchParams] = useSearchParams();
  const { getRunById } = usePromptRuns();
  const { getTemplateById, templates } = usePromptTemplates();
  const requestedRunId = searchParams.get('runId') ?? undefined;
  const requestedRun = requestedRunId ? getRunById(requestedRunId) : undefined;
  const requestedRunTemplate = requestedRun
    ? getTemplateById(requestedRun.templateId)
    : undefined;
  const canLoadRequestedRun = Boolean(
    requestedRun && requestedRunTemplate && !requestedRunTemplate.archivedAt,
  );
  const requestedTemplateId = searchParams.get('templateId') ?? undefined;
  const requestedTemplate = requestedTemplateId
    ? getTemplateById(requestedTemplateId)
    : null;
  const canLoadRequestedTemplate = Boolean(
    requestedTemplate && !requestedTemplate.archivedAt,
  );
  const defaultTemplate =
    templates.find((template) => !template.archivedAt) ?? null;
  const fallbackTemplate = canLoadRequestedTemplate
    ? requestedTemplate
    : defaultTemplate;
  const initialTemplateId = canLoadRequestedRun
    ? requestedRun?.templateId
    : canLoadRequestedTemplate
      ? requestedTemplateId
      : undefined;
  const sourceRunId = canLoadRequestedRun ? requestedRun?.id : undefined;
  const workspaceKey = sourceRunId ?? initialTemplateId ?? 'default-playground';
  let loadNotice: string | undefined;

  if (requestedRunId && !canLoadRequestedRun) {
    const message = !requestedRun
      ? 'The requested prompt snapshot is not available in this browser.'
      : !requestedRunTemplate
        ? 'The requested prompt snapshot cannot be reopened because its source template is not available.'
        : 'The requested prompt snapshot cannot be reopened because its source template is archived.';

    loadNotice = describeFallback(message, fallbackTemplate?.name);
  } else if (requestedTemplateId && !canLoadRequestedTemplate) {
    loadNotice = describeFallback(
      requestedTemplate
        ? 'The requested prompt template is archived.'
        : 'The requested prompt template is not available in this browser.',
      fallbackTemplate?.name,
    );
  }

  return (
    <PromptPlaygroundWorkspace
      key={workspaceKey}
      initialTemplateId={initialTemplateId}
      initialVariableValues={
        canLoadRequestedRun ? requestedRun?.variables : undefined
      }
      loadNotice={loadNotice}
      sourceRun={canLoadRequestedRun ? requestedRun : undefined}
    />
  );
}
