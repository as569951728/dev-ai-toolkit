import { useState } from 'react';
import type { ChangeEvent } from 'react';

import type { PromptRunNotesContextValue } from '@/features/prompt-run-notes/providers/prompt-run-notes-context';
import { parsePromptRunExportImport } from '@/features/prompt-runs/lib/prompt-run-export';
import type { PromptRunsContextValue } from '@/features/prompt-runs/providers/prompt-runs-context';

interface UsePromptRunImportOptions {
  getRunById: PromptRunsContextValue['getRunById'];
  importNotes: PromptRunNotesContextValue['importNotes'];
  importRuns: PromptRunsContextValue['importRuns'];
}

interface ImportStatus {
  message: string;
  replacedExistingRun: boolean;
  runId: string;
}

export function usePromptRunImport({
  getRunById,
  importNotes,
  importRuns,
}: UsePromptRunImportOptions) {
  const [importError, setImportError] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);

  const handleImportRun = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const payload = parsePromptRunExportImport(await file.text());
      const replacedExistingRun = Boolean(getRunById(payload.run.id));
      importRuns([payload.run]);

      if (payload.note) {
        importNotes([payload.note]);
      }

      setImportStatus({
        message: replacedExistingRun
          ? `Replaced existing ${payload.run.templateName} with data from ${file.name}.`
          : `Imported ${payload.run.templateName} from ${file.name}.`,
        replacedExistingRun,
        runId: payload.run.id,
      });
      setImportError('');
    } catch (error) {
      setImportStatus(null);
      setImportError(
        error instanceof Error
          ? error.message
          : 'Unable to import the selected prompt run JSON.',
      );
    } finally {
      event.target.value = '';
    }
  };

  return {
    handleImportRun,
    importError,
    importStatus,
  };
}
