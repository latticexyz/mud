import { SchemaAbiType, isSchemaAbiType } from "@latticexyz/schema-type";
import { KeyOf, UserTypes, includes } from "./common";

export type ValueSchemaInput<userTypes extends UserTypes> = { readonly [k: string]: SchemaAbiType | KeyOf<userTypes> };

export type ParseValueSchemaInput<userTypes extends UserTypes> =
  | KeyOf<userTypes>
  | SchemaAbiType
  | ValueSchemaInput<userTypes>;

export type ParseValueSchemaOutput<
  userTypes extends UserTypes,
  input extends ParseValueSchemaInput<userTypes>
> = input extends KeyOf<userTypes>
  ? { readonly value: userTypes[input] }
  : input extends SchemaAbiType
  ? { readonly value: input }
  : input extends ValueSchemaInput<userTypes>
  ? {
      readonly [k in KeyOf<input>]: input[k] extends KeyOf<userTypes>
        ? userTypes[input[k]]
        : input[k] extends SchemaAbiType
        ? input[k]
        : never;
    }
  : never;

export function parseValueSchema<userTypes extends UserTypes, input extends ParseValueSchemaInput<userTypes>>(
  userTypes: userTypes,
  input: input
): ParseValueSchemaOutput<userTypes, input> {
  const userTypeNames = userTypes != null ? (Object.keys(userTypes) as KeyOf<userTypes>[]) : null;
  return (
    userTypes != null && userTypeNames != null && includes(userTypeNames, input)
      ? { value: userTypes[input] }
      : isSchemaAbiType(input)
      ? { value: input }
      : Object.fromEntries(
          Object.entries(input).map(([name, value]) => [
            name,
            userTypes != null && userTypeNames != null && includes(userTypeNames, value) ? userTypes[value] : value,
          ])
        )
  ) as ParseValueSchemaOutput<userTypes, input>;
}
