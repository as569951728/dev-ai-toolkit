import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { clearLocalStorageReadIssues } from '@/lib/local-storage-recovery';

afterEach(() => {
  cleanup();
  clearLocalStorageReadIssues();
});
