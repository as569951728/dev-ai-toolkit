import type { WorkspaceBackupData } from '@/features/workspace-backup/lib/workspace-backup-transfer';
import {
  buildWorkspaceBackup,
  stringifyWorkspaceBackup,
} from '@/features/workspace-backup/lib/workspace-backup-transfer';

export function createWorkspaceBackupFilename(exportedAt = new Date().toISOString()) {
  const exportedDate = exportedAt.slice(0, 10) || 'undated';

  return `dev-ai-toolkit-workspace-${exportedDate}.json`;
}

export function createWorkspaceBackupPayload({
  exportedAt,
  ...data
}: WorkspaceBackupData & { exportedAt?: string }) {
  if (!exportedAt) {
    return stringifyWorkspaceBackup(data);
  }

  return JSON.stringify(
    {
      ...buildWorkspaceBackup(data),
      exportedAt,
    },
    null,
    2,
  );
}

export function downloadWorkspaceBackup(data: WorkspaceBackupData) {
  const exportedAt = new Date().toISOString();
  const blob = new Blob(
    [
      createWorkspaceBackupPayload({
        ...data,
        exportedAt,
      }),
    ],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = createWorkspaceBackupFilename(exportedAt);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
