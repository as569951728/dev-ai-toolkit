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
