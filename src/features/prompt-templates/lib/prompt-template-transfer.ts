import { createTemplateId } from '@/features/prompt-templates/lib/prompt-template-utils';
import { ensurePromptTemplateVersioning } from '@/features/prompt-templates/lib/prompt-template-versioning';
import type {
  PromptTemplate,
  PromptTemplateImportSummary,
  PromptTemplateRevision,
  PromptTemplateInput,
} from '@/types/prompt-template';

const EXPORT_VERSION = 1;

interface ExportedPromptTemplatesPayload {
  version: number;
  exportedAt: string;
  templates: PromptTemplate[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTags(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter(Boolean)
    : [];
}

function isValidIsoDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

function normalizePromptTemplate(
  value: unknown,
  existingTemplate?: PromptTemplate,
): PromptTemplate | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = normalizeString(value.name);
  const description = normalizeString(value.description);
  const systemPrompt = normalizeString(value.systemPrompt);
  const userPrompt = normalizeString(value.userPrompt);
  const tags = normalizeTags(value.tags);

  if (!name || !description || !systemPrompt || !userPrompt) {
    return null;
  }

  const providedId = normalizeString(value.id);
  const updatedAtValue = normalizeString(value.updatedAt);
  const providedVersion =
    isRecord(value) && typeof value.version === 'number' ? value.version : undefined;
  const providedRevisions =
    isRecord(value) && Array.isArray(value.revisions)
      ? (value.revisions as PromptTemplateRevision[])
      : undefined;

  return ensurePromptTemplateVersioning({
    id: providedId || existingTemplate?.id || createTemplateId(name),
    name,
    description,
    systemPrompt,
    userPrompt,
    tags,
    version: providedVersion ?? existingTemplate?.version,
    revisions: providedRevisions ?? existingTemplate?.revisions,
    updatedAt: isValidIsoDate(updatedAtValue)
      ? updatedAtValue
      : existingTemplate?.updatedAt || new Date().toISOString(),
  });
}

export function buildPromptTemplateExport(
  templates: PromptTemplate[],
): ExportedPromptTemplatesPayload {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    templates,
  };
}

export function stringifyPromptTemplateExport(templates: PromptTemplate[]) {
  return JSON.stringify(buildPromptTemplateExport(templates), null, 2);
}

export function parsePromptTemplateImport(
  rawValue: string,
  existingTemplates: PromptTemplate[],
) {
  const parsedValue = JSON.parse(rawValue) as unknown;
  const templatesSource = Array.isArray(parsedValue)
    ? parsedValue
    : isRecord(parsedValue) && Array.isArray(parsedValue.templates)
      ? parsedValue.templates
      : null;

  if (!templatesSource) {
    throw new Error(
      'Invalid file format. Expected a template array or an exported dev-ai-toolkit payload.',
    );
  }

  const existingTemplatesById = new Map(
    existingTemplates.map((template) => [template.id, template]),
  );

  const importedTemplates: PromptTemplate[] = [];
  let updated = 0;
  let created = 0;

  for (const item of templatesSource) {
    const candidateId =
      isRecord(item) && typeof item.id === 'string' ? item.id : '';
    const existingTemplate = candidateId
      ? existingTemplatesById.get(candidateId)
      : undefined;
    const normalizedTemplate = normalizePromptTemplate(item, existingTemplate);

    if (!normalizedTemplate) {
      continue;
    }

    if (existingTemplate) {
      updated += 1;
    } else {
      created += 1;
    }

    importedTemplates.push(normalizedTemplate);
  }

  if (importedTemplates.length === 0) {
    throw new Error(
      'No valid templates were found in the selected JSON file.',
    );
  }

  const summary: PromptTemplateImportSummary = {
    created,
    updated,
    total: importedTemplates.length,
  };

  return {
    importedTemplates,
    summary,
  };
}

export function mergePromptTemplates(
  currentTemplates: PromptTemplate[],
  importedTemplates: PromptTemplate[],
) {
  const nextTemplatesById = new Map(
    currentTemplates.map((template) => [template.id, template]),
  );

  for (const template of importedTemplates) {
    nextTemplatesById.set(template.id, template);
  }

  return [...nextTemplatesById.values()];
}

export function toPromptTemplateFromInput(input: PromptTemplateInput) {
  return {
    ...input,
    id: createTemplateId(input.name),
    updatedAt: new Date().toISOString(),
  };
}
