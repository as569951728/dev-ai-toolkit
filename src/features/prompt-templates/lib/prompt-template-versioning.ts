import type {
  PromptTemplate,
  PromptTemplateInput,
  PromptTemplateRevision,
} from '@/types/prompt-template';

type PromptTemplateVersionedShape = PromptTemplateInput & {
  id: string;
  updatedAt: string;
  archivedAt?: string | null;
  version?: number;
  revisions?: PromptTemplateRevision[];
};

function isValidVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isValidIsoDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

export function toPromptTemplateInput(
  template: Pick<
    PromptTemplate,
    'name' | 'description' | 'systemPrompt' | 'userPrompt' | 'tags'
  >,
): PromptTemplateInput {
  return {
    name: template.name,
    description: template.description,
    systemPrompt: template.systemPrompt,
    userPrompt: template.userPrompt,
    tags: template.tags,
  };
}

export function createPromptTemplateRevision(
  input: PromptTemplateInput,
  version: number,
  updatedAt: string,
): PromptTemplateRevision {
  return {
    ...input,
    version,
    updatedAt,
  };
}

export function buildPromptTemplateFromInput({
  id,
  input,
  version,
  updatedAt,
  archivedAt,
  revisions,
}: {
  id: string;
  input: PromptTemplateInput;
  version: number;
  updatedAt: string;
  archivedAt?: string | null;
  revisions?: PromptTemplateRevision[];
}): PromptTemplate {
  const nextRevisions =
    revisions ?? [createPromptTemplateRevision(input, version, updatedAt)];

  return {
    id,
    ...input,
    version,
    updatedAt,
    archivedAt: archivedAt ?? null,
    revisions: nextRevisions,
  };
}

function normalizeRevision(
  revision: PromptTemplateRevision,
): PromptTemplateRevision | null {
  if (!isValidVersion(revision.version) || !isValidIsoDate(revision.updatedAt)) {
    return null;
  }

  return {
    version: revision.version,
    updatedAt: revision.updatedAt,
    name: revision.name.trim(),
    description: revision.description.trim(),
    systemPrompt: revision.systemPrompt.trim(),
    userPrompt: revision.userPrompt.trim(),
    tags: revision.tags.filter(Boolean),
  };
}

export function ensurePromptTemplateVersioning(
  template: PromptTemplateVersionedShape,
): PromptTemplate {
  const input = toPromptTemplateInput(template);
  const version = isValidVersion(template.version) ? template.version : 1;
  const updatedAt = isValidIsoDate(template.updatedAt)
    ? template.updatedAt
    : new Date().toISOString();
  const archivedAt =
    typeof template.archivedAt === 'string' && isValidIsoDate(template.archivedAt)
      ? template.archivedAt
      : null;
  const normalizedRevisions = (template.revisions ?? [])
    .map((revision) => normalizeRevision(revision))
    .filter((revision): revision is PromptTemplateRevision => revision !== null)
    .sort((left, right) => left.version - right.version);

  const currentRevision = createPromptTemplateRevision(input, version, updatedAt);
  const hasCurrentRevision = normalizedRevisions.some(
    (revision) => revision.version === currentRevision.version,
  );

  const revisions = hasCurrentRevision
    ? normalizedRevisions
    : [...normalizedRevisions, currentRevision];

  return {
    id: template.id,
    ...input,
    version,
    updatedAt,
    archivedAt,
    revisions,
  };
}
