import type { WorkspaceBackupData } from '@/features/workspace-backup/lib/workspace-backup-transfer';
import {
  buildWorkspaceBackup,
  stringifyWorkspaceBackup,
} from '@/features/workspace-backup/lib/workspace-backup-transfer';
import { formatLocalDateForFilename } from '@/lib/filename-date';

export function createWorkspaceBackupFilename(
  exportedAt: Date | string = new Date(),
) {
  const exportedDate = formatLocalDateForFilename(exportedAt);

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
  const exportedAt = new Date();
  const blob = new Blob(
    [
      createWorkspaceBackupPayload({
        ...data,
        exportedAt: exportedAt.toISOString(),
      }),
    ],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  let link: HTMLAnchorElement | null = null;

  try {
    link = document.createElement('a');
    link.href = url;
    link.download = createWorkspaceBackupFilename(exportedAt);
    document.body.append(link);
    link.click();
  } finally {
    link?.remove();
    URL.revokeObjectURL(url);
  }
}
