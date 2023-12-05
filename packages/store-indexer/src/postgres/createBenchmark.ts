import createDebug from "debug";

export const debug = createDebug("mud:store-indexer:benchmark");

export function createBenchmark(): (stepName: string) => void {
  let start = performance.now();

  return (stepName: string): void => {
    debug("%s: %d seconds", stepName, (performance.now() - start) / 1000);
    start = performance.now();
  };
}
