import { PromptPlaygroundPreview } from '@/features/prompt-playground/components/prompt-playground-preview';
import { PromptPlaygroundTemplatePicker } from '@/features/prompt-playground/components/prompt-playground-template-picker';
import { PromptPlaygroundVariableForm } from '@/features/prompt-playground/components/prompt-playground-variable-form';
import { usePromptPlayground } from '@/features/prompt-playground/hooks/use-prompt-playground';

export function PromptPlaygroundPage() {
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
  } = usePromptPlayground();

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
        />
      </div>
    </section>
  );
}
