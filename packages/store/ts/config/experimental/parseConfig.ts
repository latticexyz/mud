import { UserTypes } from "./common";
import { ParseTablesInput, ParseTablesOutput, parseTables } from "./parseTables";

export type ParseConfigInput<userTypes extends UserTypes> = {
  readonly userTypes?: userTypes;
  readonly namespace?: string;
  readonly tables: ParseTablesInput<userTypes>;
};

export type ParseConfigOutput<userTypes extends UserTypes, input extends ParseConfigInput<userTypes>> = {
  // TODO: ensure that tables of the same name get replaced and are not a union
  readonly tables: ParseTablesOutput<
    userTypes,
    input["namespace"] extends string ? input["namespace"] : "",
    input["tables"]
  >;
};

export function parseConfig<userTypes extends UserTypes, input extends ParseConfigInput<userTypes>>(
  input: input
): ParseConfigOutput<userTypes, input> {
  const tables = Object.entries(parseTables(input.userTypes, input.namespace ?? "", input.tables));
  return {
    tables: Object.fromEntries(tables),
  } as ParseConfigOutput<userTypes, input>;
}
