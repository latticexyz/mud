let currentId = 0;

export function appendFrameId(initialUrl: string): { id: string; url: URL } {
  const id = `${Date.now()}-${++currentId}`;
  const url = new URL(initialUrl);
  url.hash = new URLSearchParams({ id }).toString();
  return { id, url };
}

export function getFrameId(url: string): string | null {
  return new URLSearchParams(new URL(url).hash.slice(1)).get("id");
}
