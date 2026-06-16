/**
 * Utility to convert raw YouTube URLs into safe, responsive Embed iframe links.
 * Normalizes formats: youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/embed/xxx, etc.
 */
export function getYoutubeId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  
  // Support for YouTube Shorts (e.g. youtube.com/shorts/xxxxxxxxx)
  if (trimmed.includes("/shorts/")) {
    const parts = trimmed.split("/shorts/");
    if (parts[1]) {
      const id = parts[1].split(/[?&#]/)[0];
      if (id.length === 11) return id;
    }
  }

  // Support for YouTube Live (e.g. youtube.com/live/xxxxxxxxx)
  if (trimmed.includes("/live/")) {
    const parts = trimmed.split("/live/");
    if (parts[1]) {
      const id = parts[1].split(/[?&#]/)[0];
      if (id.length === 11) return id;
    }
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

/**
 * Utility to convert raw YouTube URLs into safe, responsive Embed iframe links.
 * Normalizes formats: youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/embed/xxx, shorts, live, etc.
 */
export function normalizeYoutubeUrl(url: string): string {
  if (!url) return "";
  const id = getYoutubeId(url);
  if (id) {
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  return url.trim();
}
