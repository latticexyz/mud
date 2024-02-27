export type ResourceLabel<namespace extends string = string, name extends string = string> = `${namespace}__${name}`;

export function resourceToLabel<namespace extends string, name extends string>({
  namespace,
  name,
}: {
  readonly namespace: namespace;
  readonly name: name;
}): ResourceLabel<namespace, name> {
  return `${namespace}__${name}`;
}
