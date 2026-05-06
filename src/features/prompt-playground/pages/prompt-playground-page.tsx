import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PromptPlaygroundPreview } from '@/features/prompt-playground/components/prompt-playground-preview';
import { PromptPlaygroundTemplatePicker } from '@/features/prompt-playground/components/prompt-playground-template-picker';
import { PromptPlaygroundVariableForm } from '@/features/prompt-playground/components/prompt-playground-variable-form';
import { formatPromptSections } from '@/features/prompt-playground/lib/prompt-playground-utils';
import { usePromptPlayground } from '@/features/prompt-playground/hooks/use-prompt-playground';
import { usePromptRuns } from '@/features/prompt-runs/hooks/use-prompt-runs';

type PromptPlaygroundWorkspaceProps = {
  initialTemplateId?: string;
};

type SaveStatus = {
  contextKey: string;
  message: string;
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
    setSelectedTemplateId,
    updateVariableValue,
  } = usePromptPlayground(initialTemplateId);

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
          onSaveRun={() => {
            if (!selectedTemplate || !preview) {
              return;
            }

            createRun({
              templateId: selectedTemplate.id,
              templateName: selectedTemplate.name,
              templateVersion: selectedTemplate.version,
              variables: variableValues,
              systemPrompt: preview.systemPrompt,
              userPrompt: preview.userPrompt,
            });

            setSaveStatus({
              contextKey: buildPreviewContextKey(
                selectedTemplate.id,
                selectedTemplate.version,
                preview.systemPrompt,
                preview.userPrompt,
              ),
              message: `Saved a run snapshot for ${selectedTemplate.name} v${selectedTemplate.version}.`,
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
            const params = new URLSearchParams({
              left: originalPromptText,
              right: generatedPromptText,
              mode: 'compare',
              language: 'markdown',
            });
            navigate(`/code-viewer?${params.toString()}`);
          }}
        />
      </div>
    </section>
  );
}

export function PromptPlaygroundPage() {
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('templateId') ?? undefined;
  const workspaceKey = initialTemplateId ?? 'default-playground';

  return (
    <PromptPlaygroundWorkspace
      key={workspaceKey}
      initialTemplateId={initialTemplateId}
    />
  );
}
