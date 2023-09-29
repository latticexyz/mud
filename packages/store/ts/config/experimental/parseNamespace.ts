import { EmptyObject } from "./common";
import { ParseTableInput, ParseTableOutput, parseTable } from "./parseTable";

export type ParseNamespaceInput = {
  // TODO: omit namespace from table input
  readonly tables?: { readonly [k: string]: ParseTableInput };
};

export type ParseNamespaceOutput<namespace extends string, input extends ParseNamespaceInput> = {
  readonly tables: input["tables"] extends ParseTableInput
    ? {
        readonly [name in keyof input["tables"]]: ParseTableOutput<namespace, name & string, input["tables"][name]>;
      }
    : EmptyObject;
};

export function parseNamespace<namespace extends string, input extends ParseNamespaceInput>(
  namespace: namespace,
  input: input
): ParseNamespaceOutput<namespace, input> {
  return {
    tables: Object.fromEntries(
      // TODO: remove namespace from tableInput or override with the namespace we have
      //       though this may not be needed if our types omit it
      Object.entries(input.tables ?? {}).map(([name, tableInput]) => [name, parseTable(namespace, name, tableInput)])
    ),
  } as ParseNamespaceOutput<namespace, input>;
}
