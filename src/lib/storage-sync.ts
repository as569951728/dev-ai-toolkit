type StorageChangeListener = () => void;

export function subscribeToStorageKey(
  storageKey: string,
  onStorageChange: StorageChangeListener,
) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      onStorageChange();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}
