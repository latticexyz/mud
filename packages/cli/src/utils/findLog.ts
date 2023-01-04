export function findLog(deployLogLines: string[], log: string): string {
  for (const logLine of deployLogLines) {
    if (logLine.includes(log)) {
      return logLine.split(log)[1].trim();
    }
  }
  throw new Error("Can not find log");
}
