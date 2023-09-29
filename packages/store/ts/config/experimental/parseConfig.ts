import { EmptyObject, Merge, Prettify } from "./common";
import { ParseNamespacesInput, ParseNamespacesOutput, parseNamespaces } from "./parseNamespaces";
import { ParseTablesInput, ParseTablesOutput, parseTables } from "./parseTables";

export type ParseConfigInput = {
  readonly namespace?: string;
  readonly tables?: ParseTablesInput;
  readonly namespaces?: ParseNamespacesInput;
};

export type ParseConfigOutput<
  input extends ParseConfigInput,
  namespaces extends ParseNamespacesInput = input["namespaces"] extends ParseNamespacesInput
    ? input["namespaces"]
    : EmptyObject
> = {
  // TODO: ensure that tables of the same name get replaced and are not a union
  readonly tables: Prettify<
    Merge<
      ParseTablesOutput<
        input["namespace"] extends string ? input["namespace"] : "",
        input["tables"] extends ParseTablesInput ? input["tables"] : EmptyObject
      >,
      ParseNamespacesOutput<namespaces>
    >
  >;
};

export function parseConfig<input extends ParseConfigInput>(input: input): Prettify<ParseConfigOutput<input>> {
  const tables = Object.entries(parseTables(input.namespace ?? "", input.tables ?? {}));
  const namespacedTables = Object.entries(parseNamespaces(input.namespaces ?? {}));
  return {
    tables: Object.fromEntries([...tables, ...namespacedTables]),
  } as ParseConfigOutput<input>;
}
