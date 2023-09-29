import { ParseTableInput, ParseTableOutput, parseTable } from "./parseTable";

export type ParseTablesInput = { readonly [k: string]: ParseTableInput };

export type ParseTablesOutput<defaultNamespace extends string, input extends ParseTablesInput> = {
  readonly [name in keyof input]: ParseTableOutput<
    input["namespace"] extends string ? input["namespace"] : defaultNamespace,
    name & string,
    input[name]
  >;
};

export function parseTables<defaultNamespace extends string, input extends ParseTablesInput>(
  defaultNamespace: defaultNamespace,
  input: input
): ParseTablesOutput<defaultNamespace, input> {
  return Object.fromEntries(
    Object.entries(input).map(([name, tableInput]) => [name, parseTable(defaultNamespace, name, tableInput)])
  ) as ParseTablesOutput<defaultNamespace, input>;
}
