export type ResourceLabel = `${string}__${string}`;

export function resourceLabel({
  namespace,
  name,
}: {
  readonly namespace: string;
  readonly name: string;
}): ResourceLabel {
  return `${namespace}__${name}`;
}
