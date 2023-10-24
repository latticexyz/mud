import { SchemaAbiType, isSchemaAbiType } from "@latticexyz/schema-type";
import { KeyOf, UserTypes, includes, isPlainObject } from "./common";
import { ParseKeySchemaInput, ParseKeySchemaOutput, parseKeySchema } from "./parseKeySchema";
import { ParseValueSchemaInput, ParseValueSchemaOutput, parseValueSchema } from "./parseValueSchema";
import { assertExhaustive } from "@latticexyz/common/utils";
import { resourceToHex } from "@latticexyz/common";

/** @internal */
export type TableShapeInput<userTypes extends UserTypes> = {
  readonly namespace?: string;
  readonly keySchema?: ParseKeySchemaInput;
  readonly valueSchema: ParseValueSchemaInput<userTypes>;
  readonly offchainOnly?: boolean;
};

export type ParseTableInput<userTypes extends UserTypes> =
  | KeyOf<userTypes>
  | SchemaAbiType
  | TableShapeInput<userTypes>;

export type ParseTableOutput<
  userTypes extends UserTypes,
  defaultNamespace extends string,
  name extends string,
  input extends ParseTableInput<userTypes>
> = input extends SchemaAbiType
  ? ParseTableOutput<userTypes, defaultNamespace, name, { readonly valueSchema: input }>
  : input extends TableShapeInput<userTypes>
  ? {
      readonly type: input["offchainOnly"] extends true ? "offchainTable" : "table";
      readonly namespace: input["namespace"] extends string ? input["namespace"] : defaultNamespace;
      readonly name: name;
      readonly tableId: `0x${string}`;
      readonly keySchema: ParseKeySchemaOutput<
        input["keySchema"] extends ParseKeySchemaInput
          ? input["keySchema"]
          : never extends input["keySchema"]
          ? undefined
          : never
      >;
      readonly valueSchema: ParseValueSchemaOutput<userTypes, input["valueSchema"]>;
    }
  : never;

// TODO: is there a better way to check this aside from just looking at the shape/keys of the object?

/** @internal */
export const tableInputShapeKeys = ["namespace", "keySchema", "valueSchema", "offchainOnly"] as const;

/** @internal */
export function isTableShapeInput<userTypes extends UserTypes>(input: unknown): input is TableShapeInput<userTypes> {
  if (!isPlainObject(input)) return false;
  if (Object.keys(input).some((key) => !includes(tableInputShapeKeys, key))) return false;
  return true;
}

export function parseTable<
  userTypes extends UserTypes,
  defaultNamespace extends string,
  name extends string,
  input extends ParseTableInput<userTypes>
>(
  userTypes: UserTypes,
  defaultNamespace: defaultNamespace,
  name: name,
  input: input
): ParseTableOutput<userTypes, defaultNamespace, name, input> {
  const userTypeNames = userTypes != null ? (Object.keys(userTypes) as unknown as readonly KeyOf<userTypes>[]) : null;
  return (
    isSchemaAbiType(input) || (userTypeNames != null && includes(userTypeNames, input))
      ? parseTable(userTypes, defaultNamespace, name, { valueSchema: input } as const)
      : isTableShapeInput<userTypes>(input)
      ? {
          type: input.offchainOnly === true ? "offchainTable" : "table",
          namespace: input.namespace ?? defaultNamespace,
          name,
          tableId: resourceToHex({
            type: input.offchainOnly === true ? "offchainTable" : "table",
            namespace: input.namespace ?? defaultNamespace,
            name,
          }),
          keySchema: parseKeySchema(input.keySchema),
          valueSchema: parseValueSchema(userTypes, input.valueSchema),
        }
      : assertExhaustive(input, "invalid table input")
  ) as ParseTableOutput<userTypes, defaultNamespace, name, input>;
}
