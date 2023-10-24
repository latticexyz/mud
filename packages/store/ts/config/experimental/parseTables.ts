import { KeyOf, UserTypes } from "./common";
import { ParseTableInput, ParseTableOutput, parseTable } from "./parseTable";

export type ParseTablesInput<userTypes extends UserTypes> = { readonly [k: string]: ParseTableInput<userTypes> };

export type ParseTablesOutput<
  userTypes extends UserTypes,
  defaultNamespace extends string,
  input extends ParseTablesInput<userTypes>
> = {
  readonly [name in KeyOf<input>]: ParseTableOutput<
    userTypes,
    input["namespace"] extends string ? input["namespace"] : defaultNamespace,
    name,
    input[name]
  >;
};

export function parseTables<
  userTypes extends UserTypes,
  defaultNamespace extends string,
  input extends ParseTablesInput<userTypes>
>(
  userTypes: UserTypes,
  defaultNamespace: defaultNamespace,
  input: input
): ParseTablesOutput<userTypes, defaultNamespace, input> {
  return Object.fromEntries(
    Object.entries(input).map(([name, tableInput]) => [name, parseTable(userTypes, defaultNamespace, name, tableInput)])
  ) as ParseTablesOutput<userTypes, defaultNamespace, input>;
}
