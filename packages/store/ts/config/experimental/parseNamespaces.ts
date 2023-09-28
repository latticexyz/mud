import { ParseNamespaceInput, ParseNamespaceOutput, parseNamespace } from "./parseNamespace";

export type ParseNamespacesInput = Readonly<Record<string, ParseNamespaceInput>>;

export type ParseNamespacesOutput<input extends ParseNamespacesInput> = Readonly<
  {
    [namespace in keyof input & string]: ParseNamespaceOutput<namespace, input[namespace]>;
  }[keyof input & string]["tables"]
>;

export function parseNamespaces<input extends ParseNamespacesInput>(input: input): ParseNamespacesOutput<input> {
  return Object.fromEntries(
    Object.entries(input).flatMap(([namespace, namespaceInput]) => {
      const { tables } = parseNamespace(namespace, namespaceInput);
      return Object.entries(tables);
    })
  ) as ParseNamespacesOutput<input>;
}
