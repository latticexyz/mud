import { TableInput, TableOutput, parseTable } from "./table";

export type ConfigInput = Readonly<{
  namespace?: string;
  tables?: Record<string, TableInput>;
}>;

export type ConfigOutput<input extends ConfigInput> = Readonly<{
  tables: Readonly<{
    [tableName in keyof NonNullable<input["tables"]> & string]: TableOutput<
      input["namespace"] extends string ? input["namespace"] : "",
      tableName,
      NonNullable<input["tables"]>[tableName]
    >;
  }>;
}>;

export function parseConfig<input extends ConfigInput>(input: input): ConfigOutput<input> {
  return {
    tables: Object.fromEntries(
      Object.entries(input.tables ?? {}).map(([tableName, table]) => [
        tableName,
        parseTable(input.namespace ?? "", tableName, table),
      ])
    ),
  } as ConfigOutput<input>;
}
