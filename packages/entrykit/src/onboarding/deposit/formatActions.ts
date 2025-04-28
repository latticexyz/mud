export function formatActions(actions: bigint): string {
  if (actions >= 10_000_000n) return "10M+";
  if (actions >= 1_000_000n) return `${Number(actions / 100_000n) / 10}M`;
  if (actions >= 1_000n) return `${Number(actions / 10n) / 100}K`;
  return `${actions}`;
}
