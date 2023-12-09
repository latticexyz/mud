import createDebug from "debug";

const parentDebug = createDebug("mud:benchmark");

// Pipe debug output to stdout instead of stderr
parentDebug.log = console.debug.bind(console);

export function createBenchmark(namespace: string): (stepName: string) => void {
  const debug = parentDebug.extend(namespace);
  let lastStep = performance.now();

  return (stepName: string) => {
    const secondsSinceLastStep = (performance.now() - lastStep) / 1000;
    debug("%s: +%ds", stepName, secondsSinceLastStep);
    lastStep = performance.now();
  };
}
