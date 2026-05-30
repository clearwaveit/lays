/** Keep only path or remote URLs in persisted campaign data. */
export function sanitizeStoredImageSrc(src: string, fallback: string): string {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:")) return fallback;
  if (trimmed.startsWith("/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return fallback;
}
