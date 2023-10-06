export function resourceLabel({ namespace, name }: { readonly namespace: string; readonly name: string }): string {
  return `${namespace}:${name}`;
}
