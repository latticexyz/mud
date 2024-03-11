export function waitForIdle(ms = 1): Promise<void> {
  return new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => resolve());
    } else {
      setTimeout(() => resolve(), ms);
    }
  });
}
