/**
 * Extracts a string message from the error.
 * Uses `error.message` field by default if available.
 */
export function getMessageFromError(error: unknown, defaultMessage?: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage ?? `${error}`;
}
