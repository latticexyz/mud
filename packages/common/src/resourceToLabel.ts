import { ROOT_NAMESPACE } from "./common";

export type ResourceLabel<
  namespace extends string = string,
  name extends string = string,
> = namespace extends typeof ROOT_NAMESPACE ? name : `${namespace}__${name}`;

export function resourceToLabel<namespace extends string, name extends string>({
  namespace,
  name,
}: {
  readonly namespace: namespace;
  readonly name: name;
}): ResourceLabel<namespace, name> {
  return (namespace === ROOT_NAMESPACE ? name : `${namespace}__${name}`) as ResourceLabel<namespace, name>;
}
