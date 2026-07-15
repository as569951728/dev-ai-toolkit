import type { StorageLike } from '@/lib/browser-storage';

export type LocalStorageReadIssueReason = 'invalid-data' | 'invalid-json';

export interface LocalStorageReadIssue {
  label: string;
  rawValue: string;
  reason: LocalStorageReadIssueReason;
  storageKey: string;
}

export interface LocalStorageDecodeResult<T> {
  recovered: boolean;
  value: T;
}

type LocalStorageIssueListener = () => void;

const issuesByStorageKey = new Map<string, LocalStorageReadIssue>();
const listeners = new Set<LocalStorageIssueListener>();
let issueSnapshot: LocalStorageReadIssue[] = [];

function refreshIssueSnapshot() {
  issueSnapshot = [...issuesByStorageKey.values()];
  listeners.forEach((listener) => listener());
}

export function reportLocalStorageReadIssue(issue: LocalStorageReadIssue) {
  const currentIssue = issuesByStorageKey.get(issue.storageKey);

  if (
    currentIssue?.label === issue.label &&
    currentIssue.rawValue === issue.rawValue &&
    currentIssue.reason === issue.reason
  ) {
    return;
  }

  issuesByStorageKey.set(issue.storageKey, issue);
  refreshIssueSnapshot();
}

export function clearLocalStorageReadIssue(storageKey: string) {
  if (!issuesByStorageKey.delete(storageKey)) {
    return;
  }

  refreshIssueSnapshot();
}

export function clearLocalStorageReadIssues() {
  if (issuesByStorageKey.size === 0) {
    return;
  }

  issuesByStorageKey.clear();
  refreshIssueSnapshot();
}

export function getLocalStorageReadIssues() {
  return issueSnapshot;
}

export function subscribeToLocalStorageReadIssues(
  listener: LocalStorageIssueListener,
) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function hasLocalStorageReadIssue(storageKey: string) {
  return issuesByStorageKey.has(storageKey);
}

export function assertLocalStorageKeyWritable(storageKey: string) {
  if (hasLocalStorageReadIssue(storageKey)) {
    throw new Error(
      'Unreadable local data must be downloaded or reset before it can be replaced.',
    );
  }
}

export function decodeLocalStorageValue<T>({
  decode,
  label,
  rawValue,
  storageKey,
}: {
  decode: (value: unknown) => LocalStorageDecodeResult<T> | null;
  label: string;
  rawValue: string;
  storageKey: string;
}) {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawValue) as unknown;
  } catch {
    reportLocalStorageReadIssue({
      label,
      rawValue,
      reason: 'invalid-json',
      storageKey,
    });
    return null;
  }

  const result = decode(parsedValue);

  if (!result) {
    reportLocalStorageReadIssue({
      label,
      rawValue,
      reason: 'invalid-data',
      storageKey,
    });
    return null;
  }

  if (result.recovered) {
    reportLocalStorageReadIssue({
      label,
      rawValue,
      reason: 'invalid-data',
      storageKey,
    });
  } else {
    clearLocalStorageReadIssue(storageKey);
  }

  return result.value;
}

export function createLocalStorageRecoveryFilename(
  exportedAt = new Date().toISOString(),
) {
  const exportedDate = exportedAt.slice(0, 10) || 'undated';

  return `dev-ai-toolkit-unreadable-local-data-${exportedDate}.json`;
}

export function createLocalStorageRecoveryPayload(
  issues: LocalStorageReadIssue[],
  exportedAt = new Date().toISOString(),
) {
  return JSON.stringify(
    {
      version: 1,
      exportedAt,
      entries: issues,
    },
    null,
    2,
  );
}

export function downloadLocalStorageRecovery(
  issues: LocalStorageReadIssue[],
) {
  const exportedAt = new Date().toISOString();
  const blob = new Blob(
    [createLocalStorageRecoveryPayload(issues, exportedAt)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  let link: HTMLAnchorElement | null = null;

  try {
    link = document.createElement('a');
    link.href = url;
    link.download = createLocalStorageRecoveryFilename(exportedAt);
    document.body.append(link);
    link.click();
  } finally {
    link?.remove();
    URL.revokeObjectURL(url);
  }
}

export function resetLocalStorageReadIssues(
  issues: LocalStorageReadIssue[],
  storage: StorageLike | null,
) {
  if (!storage?.removeItem) {
    throw new Error('Browser storage cannot remove the unreadable data.');
  }

  const removedIssues: LocalStorageReadIssue[] = [];

  try {
    issues.forEach((issue) => {
      storage.removeItem?.(issue.storageKey);
      removedIssues.push(issue);
    });
  } catch (removeError) {
    let rollbackError: unknown;

    removedIssues.reverse().forEach((issue) => {
      try {
        storage.setItem(issue.storageKey, issue.rawValue);
      } catch (error) {
        rollbackError ??= error;
      }
    });

    throw rollbackError ?? removeError;
  }

  issues.forEach((issue) => clearLocalStorageReadIssue(issue.storageKey));
}
