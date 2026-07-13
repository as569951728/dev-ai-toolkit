import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { buildCodeViewerUrl } from '@/features/code-viewer/lib/code-viewer-utils';
import { PromptPlaygroundPreview } from '@/features/prompt-playground/components/prompt-playground-preview';
import { PromptPlaygroundTemplatePicker } from '@/features/prompt-playground/components/prompt-playground-template-picker';
import { PromptPlaygroundVariableForm } from '@/features/prompt-playground/components/prompt-playground-variable-form';
import { usePromptPlayground } from '@/features/prompt-playground/hooks/use-prompt-playground';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';
import { usePromptTemplates } from '@/features/prompt-templates/hooks/use-prompt-templates';
import { formatPromptSections } from '@/lib/prompt-sections';

type PromptPlaygroundWorkspaceProps = {
  initialTemplateId?: string;
  initialVariableValues?: Record<string, string>;
  sourceRunId?: string;
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

function PromptPlaygroundWorkspace({
  initialTemplateId,
  initialVariableValues,
  sourceRunId,
}: PromptPlaygroundWorkspaceProps) {
  const navigate = useNavigate();
  const { createRun } = usePromptRuns();
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

  const saveStatusMessage =
    saveStatus && saveStatus.contextKey === currentPreviewContextKey
      ? saveStatus.message
      : null;
  const savedRunId =
    saveStatus && saveStatus.contextKey === currentPreviewContextKey
      ? saveStatus.runId
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

      {sourceRunId ? (
        <p className="status-banner" role="status">
          Loaded captured variables from a{' '}
          <Link to={`/runs/${sourceRunId}`}>saved prompt snapshot</Link>. Changes
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
              message: `Saved a run snapshot for ${selectedTemplate.name} v${selectedTemplate.version}.`,
              runId: savedRun.id,
              tone: 'success',
            });
          }}
          onReviewInPromptDiff={() => {
            const params = new URLSearchParams({
              left: originalPromptText,
              right: generatedPromptText,
            });
            navigate(`/prompt-diff?${params.toString()}`);
          }}
          onOpenInCodeViewer={() => {
            navigate(
              buildCodeViewerUrl({
                left: originalPromptText,
                right: generatedPromptText,
                mode: 'compare',
                language: 'markdown',
              }),
            );
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
  const { getTemplateById } = usePromptTemplates();
  const requestedRunId = searchParams.get('runId') ?? undefined;
  const requestedRun = requestedRunId ? getRunById(requestedRunId) : undefined;
  const requestedRunTemplate = requestedRun
    ? getTemplateById(requestedRun.templateId)
    : undefined;
  const canLoadRequestedRun = Boolean(
    requestedRun && requestedRunTemplate && !requestedRunTemplate.archivedAt,
  );
  const initialTemplateId = canLoadRequestedRun
    ? requestedRun?.templateId
    : (searchParams.get('templateId') ?? undefined);
  const sourceRunId = canLoadRequestedRun ? requestedRun?.id : undefined;
  const workspaceKey = sourceRunId ?? initialTemplateId ?? 'default-playground';

  return (
    <PromptPlaygroundWorkspace
      key={workspaceKey}
      initialTemplateId={initialTemplateId}
      initialVariableValues={
        canLoadRequestedRun ? requestedRun?.variables : undefined
      }
      sourceRunId={sourceRunId}
    />
  );
}
