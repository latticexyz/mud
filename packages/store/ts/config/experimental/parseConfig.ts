import { ParseTableInput, ParseTableOutput, parseTable } from "./parseTable";

export type ParseConfigInput = Readonly<{
  namespace?: string;
  tables?: Record<string, ParseTableInput>;
}>;

export type ParseConfigOutput<input extends ParseConfigInput> = Readonly<{
  tables: Readonly<{
    [tableName in keyof NonNullable<input["tables"]> & string]: ParseTableOutput<
      input["namespace"] extends string ? input["namespace"] : "",
      tableName,
      NonNullable<input["tables"]>[tableName]
    >;
  }>;
}>;

export function parseConfig<input extends ParseConfigInput>(input: input): ParseConfigOutput<input> {
  return {
    tables: Object.fromEntries(
      Object.entries(input.tables ?? {}).map(([tableName, table]) => [
        tableName,
        parseTable(input.namespace ?? "", tableName, table),
      ])
    ),
  } as ParseConfigOutput<input>;
}
