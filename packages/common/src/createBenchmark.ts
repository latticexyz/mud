import createDebug from "debug";

export function createBenchmark(namespace: string): (stepName: string) => void {
  const debug = createDebug("mud:benchmark:" + namespace);
  let lastStep = performance.now();

  return (stepName: string) => {
    const secondsSinceLastStep = (performance.now() - lastStep) / 1000;
    debug("%s: +%ds", stepName, secondsSinceLastStep);
    lastStep = performance.now();
  };
}
