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
    ? [...new Set(
        value
          .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
          .filter(Boolean),
      )]
    : [];
}

function isValidIsoDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

function normalizeOptionalIsoDate(value: unknown) {
  const normalizedValue = normalizeString(value);

  return normalizedValue && isValidIsoDate(normalizedValue)
    ? normalizedValue
    : null;
}

function normalizeRevision(
  value: unknown,
): PromptTemplateRevision | null {
  if (!isRecord(value)) {
    return null;
  }

  const version = typeof value.version === 'number' ? value.version : NaN;
  const updatedAt = normalizeString(value.updatedAt);
  const name = normalizeString(value.name);
  const description = normalizeString(value.description);
  const systemPrompt = normalizeString(value.systemPrompt);
  const userPrompt = normalizeString(value.userPrompt);

  if (
    !Number.isInteger(version) ||
    version <= 0 ||
    !isValidIsoDate(updatedAt) ||
    !name ||
    !description ||
    !systemPrompt ||
    !userPrompt
  ) {
    return null;
  }

  return {
    version,
    updatedAt,
    name,
    description,
    systemPrompt,
    userPrompt,
    tags: normalizeTags(value.tags),
  };
}

function normalizeRevisions(
  value: unknown,
): PromptTemplateRevision[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const revisions = value
    .map((revision) => normalizeRevision(revision))
    .filter((revision): revision is PromptTemplateRevision => revision !== null);

  return revisions.length > 0 ? revisions : undefined;
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
  const updatedAtValue = normalizeOptionalIsoDate(value.updatedAt);
  const archivedAtValue = normalizeOptionalIsoDate(value.archivedAt);
  const providedVersion =
    isRecord(value) && typeof value.version === 'number' ? value.version : undefined;
  const providedRevisions = normalizeRevisions(value.revisions);

  return ensurePromptTemplateVersioning({
    id: providedId || existingTemplate?.id || createTemplateId(name),
    name,
    description,
    systemPrompt,
    userPrompt,
    tags,
    version: providedVersion ?? existingTemplate?.version,
    revisions: providedRevisions ?? existingTemplate?.revisions,
    archivedAt: archivedAtValue ?? existingTemplate?.archivedAt ?? null,
    updatedAt:
      updatedAtValue ??
      existingTemplate?.updatedAt ??
      new Date().toISOString(),
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

  const importedTemplatesById = new Map<string, PromptTemplate>();
  const createdTemplateIds = new Set<string>();
  const updatedTemplateIds = new Set<string>();
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

    const alreadyImported = importedTemplatesById.has(normalizedTemplate.id);

    if (!alreadyImported) {
      if (existingTemplate) {
        updatedTemplateIds.add(normalizedTemplate.id);
      } else {
        createdTemplateIds.add(normalizedTemplate.id);
      }
    }

    importedTemplatesById.set(normalizedTemplate.id, normalizedTemplate);
  }

  const importedTemplates = [...importedTemplatesById.values()];

  if (importedTemplates.length === 0) {
    throw new Error(
      'No valid templates were found in the selected JSON file.',
    );
  }

  created = createdTemplateIds.size;
  updated = updatedTemplateIds.size;

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
    archivedAt: null,
    updatedAt: new Date().toISOString(),
  };
}
