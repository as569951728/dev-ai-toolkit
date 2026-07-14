export function isValidDateString(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !Number.isNaN(new Date(value).getTime())
  );
}
