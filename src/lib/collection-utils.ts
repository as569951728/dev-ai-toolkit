export function keepLastByKey<T>(
  items: T[],
  getKey: (item: T) => string,
) {
  const itemsByKey = new Map<string, T>();

  for (const item of items) {
    itemsByKey.set(getKey(item), item);
  }

  return [...itemsByKey.values()];
}
