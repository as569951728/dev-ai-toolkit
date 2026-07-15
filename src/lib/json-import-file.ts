export const MAX_JSON_IMPORT_BYTES = 5 * 1024 * 1024;

type JsonImportFile = Pick<File, 'size' | 'text'>;

export function assertJsonImportFileSize(
  file: Pick<JsonImportFile, 'size'>,
  maxBytes = MAX_JSON_IMPORT_BYTES,
) {
  if (file.size > maxBytes) {
    throw new Error(
      'The selected JSON file is larger than the 5 MB import limit.',
    );
  }
}

export async function readJsonImportFile(file: JsonImportFile) {
  assertJsonImportFileSize(file);

  return file.text();
}
