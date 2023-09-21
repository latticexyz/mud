import { ParseTableInput, ParseTableOutput, parseTable } from "./parseTable";

export type ParseTablesInput = Readonly<Record<string, ParseTableInput>>;

export type ParseTablesOutput<defaultNamespace extends string, input extends ParseTablesInput> = Readonly<{
  [tableName in keyof input & string]: ParseTableOutput<
    input["namespace"] extends string ? input["namespace"] : defaultNamespace,
    tableName,
    input[tableName]
  >;
}>;

export function parseTables<defaultNamespace extends string, input extends ParseTablesInput>(
  defaultNamespace: defaultNamespace,
  input: input
): ParseTablesOutput<defaultNamespace, input> {
  return Object.fromEntries(
    Object.entries(input).map(([tableName, table]) => [tableName, parseTable(defaultNamespace, tableName, table)])
  ) as ParseTablesOutput<defaultNamespace, input>;
}
