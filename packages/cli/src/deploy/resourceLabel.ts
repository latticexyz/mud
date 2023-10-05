export function resourceLabel({ namespace, name }: { namespace: string; name: string }): string {
  return `${namespace}:${name}`;
}
