/** Prefix relative URLs with the GitHub Pages project basePath. */
export function withBase(path: string): string {
  if (!path) return path;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("//") ||
    path.startsWith("#")
  ) {
    return path;
  }
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!base) return path;
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}

/** Resolve image URLs: remote absolute stay; local /uploads get basePath. */
export function mediaUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return withBase(url);
}
