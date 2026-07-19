import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { useLocalization } from '@/features/localization/localization-context';
import type { PromptRunNotesContextValue } from '@/features/prompt-run-notes/providers/prompt-run-notes-context';
import { parsePromptRunExportImport } from '@/features/prompt-runs/lib/prompt-run-export';
import type { PromptRunsContextValue } from '@/features/prompt-runs/providers/prompt-runs-context';
import { readJsonImportFile } from '@/lib/json-import-file';

interface UsePromptRunImportOptions {
  deleteRun: PromptRunsContextValue['deleteRun'];
  getRunById: PromptRunsContextValue['getRunById'];
  importNotes: PromptRunNotesContextValue['importNotes'];
  importRuns: PromptRunsContextValue['importRuns'];
}

interface ImportStatus {
  message: string;
  replacedExistingRun: boolean;
  runId: string;
}

interface PendingImport {
  fileName: string;
  payload: ReturnType<typeof parsePromptRunExportImport>;
}

export class PromptRunImportRollbackError extends Error {
  readonly rollbackCause: unknown;

  constructor(
    replacedExistingRun: boolean,
    noteImportCause: unknown,
    rollbackCause: unknown,
  ) {
    super(
      replacedExistingRun
        ? 'Prompt run import failed, and the previous local run could not be restored. Imported run data may still be present.'
        : 'Prompt run import failed, and the new local run could not be removed. The imported run may still be present.',
      { cause: noteImportCause },
    );
    this.name = 'PromptRunImportRollbackError';
    this.rollbackCause = rollbackCause;
  }
}

export function usePromptRunImport({
  deleteRun,
  getRunById,
  importNotes,
  importRuns,
}: UsePromptRunImportOptions) {
  const { language, t } = useLocalization();
  const [importError, setImportError] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);

  const [pendingImport, setPendingImport] = useState<PendingImport | null>(
    null,
  );

  const importRun = ({ fileName, payload }: PendingImport) => {
    const existingRun = getRunById(payload.run.id);
    const replacedExistingRun = Boolean(existingRun);

    try {
      importRuns([payload.run]);

      if (payload.note) {
        try {
          importNotes([payload.note]);
        } catch (error) {
          try {
            if (existingRun) {
              importRuns([existingRun]);
            } else {
              deleteRun(payload.run.id);
            }
          } catch (rollbackError) {
            throw new PromptRunImportRollbackError(
              replacedExistingRun,
              error,
              rollbackError,
            );
          }

          throw error;
        }
      }

      setImportStatus({
        message: t(
          replacedExistingRun
            ? 'runs.import.replacedMessage'
            : 'runs.import.importedMessage',
          { file: fileName, name: payload.run.templateName },
        ),
        replacedExistingRun,
        runId: payload.run.id,
      });
      setImportError('');
    } catch (error) {
      setImportStatus(null);
      setImportError(
        error instanceof PromptRunImportRollbackError
          ? language === 'en'
            ? error.message
            : t(
                replacedExistingRun
                  ? 'runs.import.rollbackReplaced'
                  : 'runs.import.rollbackAdded',
              )
          : language === 'en' && error instanceof Error
            ? error.message
            : t('runs.import.error'),
      );
    }
  };

  const handleImportRun = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPendingImport(null);

    try {
      const payload = parsePromptRunExportImport(await readJsonImportFile(file));
      const existingRun = getRunById(payload.run.id);

      if (existingRun) {
        setPendingImport({ fileName: file.name, payload });
        setImportStatus(null);
        setImportError('');
      } else {
        importRun({ fileName: file.name, payload });
      }
    } catch (error) {
      setImportStatus(null);
      setImportError(
        language === 'en' && error instanceof Error
          ? error.message
          : t('runs.import.error'),
      );
    } finally {
      event.target.value = '';
    }
  };

  return {
    cancelPendingImport: () => setPendingImport(null),
    confirmPendingImport: () => {
      if (!pendingImport) {
        return;
      }

      importRun(pendingImport);
      setPendingImport(null);
    },
    handleImportRun,
    importError,
    importStatus,
    pendingImport,
  };
}
