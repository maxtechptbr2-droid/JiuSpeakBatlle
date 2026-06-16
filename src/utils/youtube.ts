/**
 * Utility to convert raw YouTube URLs into safe, responsive Embed iframe links.
 * Normalizes formats: youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/embed/xxx, etc.
 */
export function normalizeYoutubeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : "";

  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  return trimmed;
}

/**
 * Extracts raw YouTube ID for custom layout hooks.
 */
export function getYoutubeId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}
