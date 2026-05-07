const CURRENT_LOCAL_STORAGE_SCHEMA_VERSION = 1;

interface PersistedCollectionPayload<T> {
  version: number;
  data: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readVersionedCollection<T>(
  value: unknown,
): T[] | null {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (
    isRecord(value) &&
    value.version === CURRENT_LOCAL_STORAGE_SCHEMA_VERSION &&
    Array.isArray(value.data)
  ) {
    return value.data as T[];
  }

  return null;
}

export function writeVersionedCollection<T>(
  data: T[],
): PersistedCollectionPayload<T[]> {
  return {
    version: CURRENT_LOCAL_STORAGE_SCHEMA_VERSION,
    data,
  };
}

export { CURRENT_LOCAL_STORAGE_SCHEMA_VERSION };
