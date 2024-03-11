export function waitForIdle(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve());
    } else {
      setTimeout(() => resolve(), 1);
    }
  });
}
