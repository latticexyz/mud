export function waitForIdle(): Promise<void> {
  return new Promise<void>((resolve) => {
    requestIdleCallback(() => resolve());
  });
}
