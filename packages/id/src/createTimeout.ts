export function createTimeout(ms: number): {
  readonly promise: Promise<never>;
  readonly signal: AbortSignal;
} {
  const signal = AbortSignal.timeout(ms);
  const promise = new Promise<never>((resolve, reject) => {
    signal.addEventListener(
      "abort",
      () => {
        reject(signal.reason);
      },
      { once: true },
    );
  });
  return {
    signal,
    promise,
  };
}
