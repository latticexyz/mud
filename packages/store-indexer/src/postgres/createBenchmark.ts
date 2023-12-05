import { debug } from "../debug";

export function createBenchmark(): (stepName: string) => void {
  let start = performance.now();

  return (stepName: string): void => {
    debug("%s: %d seconds", stepName, (performance.now() - start) / 1000);
    start = performance.now();
  };
}
