import { EmptyObject, Prettify } from "./common";
import { ParseNamespaceInput, ParseNamespaceOutput, parseNamespace } from "./parseNamespace";
import { ParseTablesInput, ParseTablesOutput, parseTables } from "./parseTables";

type Namespaces = Readonly<Record<string, ParseNamespaceInput>>;

export type ParseConfigInput = Readonly<{
  namespace?: string;
  tables?: ParseTablesInput;
  namespaces?: Namespaces;
}>;

export type ParseConfigOutput<
  input extends ParseConfigInput,
  namespaces extends Namespaces = input["namespaces"] extends Namespaces ? input["namespaces"] : EmptyObject
> = {
  // TODO: ensure that tables of the same name get replaced and are not a union
  readonly tables: Prettify<
    ParseTablesOutput<input["namespace"] extends string ? input["namespace"] : "", NonNullable<input["tables"]>> &
      {
        [namespace in keyof namespaces & string]: ParseNamespaceOutput<namespace, namespaces[namespace]>;
      }[keyof namespaces & string]["tables"]
  >;
};

export function parseConfig<input extends ParseConfigInput>(input: input): Prettify<ParseConfigOutput<input>> {
  const tables = Object.entries(parseTables(input.namespace ?? "", input.tables ?? {}));
  const namespaces = Object.entries(input.namespaces ?? {}).map(([namespace, namespaceInput]) =>
    parseNamespace(namespace, namespaceInput)
  );
  const namespacedTables = namespaces.flatMap((namespace) => Object.entries(namespace.tables));

  return {
    tables: Object.fromEntries([...tables, ...namespacedTables]),
  } as ParseConfigOutput<input>;
}
