export function parseTags(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      return value.map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // Tags are stored as JSON; fall through for legacy comma-separated values.
  }

  return raw
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags);
}
