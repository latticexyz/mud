// TODO: better support for small fractions like 0.0000001

export function truncateDecimal(value: string): string {
  return value.replace(/^(\d+)(\.\d+)?$/, (_match: string, whole: string, fraction: string | undefined) => {
    return `${whole}${(fraction ?? "").slice(0, 2 + Math.max(0, 5 - whole.length))}`;
  });
}
