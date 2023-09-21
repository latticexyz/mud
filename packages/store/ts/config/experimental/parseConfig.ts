import { ParseTablesInput, ParseTablesOutput, parseTables } from "./parseTables";

export type ParseConfigInput = Readonly<{
  namespace?: string;
  tables?: ParseTablesInput;
}>;

export type ParseConfigOutput<input extends ParseConfigInput> = Readonly<{
  tables: ParseTablesOutput<input["namespace"] extends string ? input["namespace"] : "", NonNullable<input["tables"]>>;
}>;

export function parseConfig<input extends ParseConfigInput>(input: input): ParseConfigOutput<input> {
  return {
    tables: parseTables(input.namespace ?? "", input.tables ?? {}),
  } as ParseConfigOutput<input>;
}
