import { ErrorMessage, conform, narrow } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type/internal";
import { Hex } from "viem";
import { get, hasOwnKey } from "./generics";
import { resolveSchema, validateSchema } from "./schema";
import { AbiTypeScope, Scope, getStaticAbiTypeKeys } from "./scope";
import { TableCodegen } from "./output";
import { TABLE_CODEGEN_DEFAULTS, TABLE_DEFAULTS } from "./defaults";
import { resourceToHex } from "@latticexyz/common";
import { SchemaInput, TableInput } from "./input";
import { Table } from "@latticexyz/config";

export type ValidKeys<schema extends SchemaInput, scope extends Scope> = readonly [
  getStaticAbiTypeKeys<schema, scope>,
  ...getStaticAbiTypeKeys<schema, scope>[],
];

function getValidKeys<schema extends SchemaInput, scope extends Scope = AbiTypeScope>(
  schema: schema,
  scope: scope = AbiTypeScope as unknown as scope,
): ValidKeys<schema, scope> {
  return Object.entries(schema)
    .filter(([, internalType]) => hasOwnKey(scope.types, internalType) && isStaticAbiType(scope.types[internalType]))
    .map(([key]) => key) as unknown as ValidKeys<schema, scope>;
}

export function isValidPrimaryKey<schema extends SchemaInput, scope extends Scope>(
  key: unknown,
  schema: schema,
  scope: scope = AbiTypeScope as unknown as scope,
): key is ValidKeys<schema, scope> {
  return (
    Array.isArray(key) &&
    key.every(
      (key) =>
        hasOwnKey(schema, key) && hasOwnKey(scope.types, schema[key]) && isStaticAbiType(scope.types[schema[key]]),
    )
  );
}

export type validateKeys<validKeys extends PropertyKey, keys> = {
  [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
};

export type ValidateTableOptions = { inStoreContext: boolean };

export type validateTable<
  input,
  scope extends Scope = AbiTypeScope,
  options extends ValidateTableOptions = { inStoreContext: false },
> = {
  [key in keyof input]: key extends "key"
    ? validateKeys<getStaticAbiTypeKeys<conform<get<input, "schema">, SchemaInput>, scope>, input[key]>
    : key extends "schema"
      ? validateSchema<input[key], scope>
      : key extends "name" | "namespace"
        ? options["inStoreContext"] extends true
          ? ErrorMessage<"Overrides of `name` and `namespace` are not allowed for tables in a store config">
          : narrow<input[key]>
        : key extends keyof TableInput
          ? TableInput[key]
          : ErrorMessage<`Key \`${key & string}\` does not exist in TableInput`>;
};

export function validateTable<input, scope extends Scope = AbiTypeScope>(
  input: input,
  scope: scope = AbiTypeScope as unknown as scope,
  options: ValidateTableOptions = { inStoreContext: false },
): asserts input is TableInput & input {
  if (typeof input !== "object" || input == null) {
    throw new Error(`Expected full table config, got \`${JSON.stringify(input)}\``);
  }

  if (!hasOwnKey(input, "schema")) {
    throw new Error("Missing schema input");
  }
  validateSchema(input.schema, scope);

  if (!hasOwnKey(input, "key") || !isValidPrimaryKey(input["key"], input["schema"], scope)) {
    throw new Error(
      `Invalid key. Expected \`(${getValidKeys(input["schema"], scope)
        .map((item) => `"${String(item)}"`)
        .join(" | ")})[]\`, received \`${
        hasOwnKey(input, "key") && Array.isArray(input.key)
          ? `[${input.key.map((item) => `"${item}"`).join(", ")}]`
          : "undefined"
      }\``,
    );
  }

  if ((options.inStoreContext && hasOwnKey(input, "name")) || hasOwnKey(input, "namespace")) {
    throw new Error("Overrides of `name` and `namespace` are not allowed for tables in a store config.");
  }
}

export type resolveTableCodegen<input extends TableInput> = {
  [key in keyof TableCodegen]-?: key extends keyof input["codegen"]
    ? undefined extends input["codegen"][key]
      ? key extends "dataStruct"
        ? boolean
        : key extends keyof typeof TABLE_CODEGEN_DEFAULTS
          ? (typeof TABLE_CODEGEN_DEFAULTS)[key]
          : never
      : input["codegen"][key]
    : // dataStruct isn't narrowed, because its value is conditional on the number of value schema fields
      key extends "dataStruct"
      ? boolean
      : key extends keyof typeof TABLE_CODEGEN_DEFAULTS
        ? (typeof TABLE_CODEGEN_DEFAULTS)[key]
        : never;
};

export function resolveTableCodegen<input extends TableInput>(input: input): resolveTableCodegen<input> {
  const options = input.codegen;
  return {
    directory: get(options, "directory") ?? TABLE_CODEGEN_DEFAULTS.directory,
    tableIdArgument: get(options, "tableIdArgument") ?? TABLE_CODEGEN_DEFAULTS.tableIdArgument,
    storeArgument: get(options, "storeArgument") ?? TABLE_CODEGEN_DEFAULTS.storeArgument,
    // dataStruct is true if there are at least 2 value fields
    dataStruct: get(options, "dataStruct") ?? Object.keys(input.schema).length - input.key.length > 1,
  } satisfies TableCodegen as resolveTableCodegen<input>;
}

export type resolveTable<input, scope extends Scope = Scope> = input extends TableInput
  ? {
      readonly tableId: Hex;
      readonly name: input["name"];
      readonly namespace: undefined extends input["namespace"] ? typeof TABLE_DEFAULTS.namespace : input["namespace"];
      readonly type: undefined extends input["type"] ? typeof TABLE_DEFAULTS.type : input["type"];
      readonly key: Readonly<input["key"]>;
      readonly schema: resolveSchema<input["schema"], scope>;
      readonly keySchema: resolveSchema<
        {
          readonly [key in input["key"][number]]: input["schema"][key];
        },
        scope
      >;
      readonly valueSchema: resolveSchema<
        {
          readonly [key in Exclude<keyof input["schema"], input["key"][number]>]: input["schema"][key];
        },
        scope
      >;
      readonly codegen: resolveTableCodegen<input>;
    }
  : never;

export function resolveTable<input extends TableInput, scope extends Scope = AbiTypeScope>(
  input: input,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveTable<input, scope> {
  const name = input.name;
  const type = input.type ?? TABLE_DEFAULTS.type;
  const namespace = input.namespace ?? TABLE_DEFAULTS.namespace;
  const tableId = input.tableId ?? resourceToHex({ type, namespace, name });

  return {
    tableId,
    name,
    namespace,
    type,
    key: input.key,
    schema: resolveSchema(input.schema, scope),
    keySchema: resolveSchema(
      Object.fromEntries(
        Object.entries(input.schema).filter(([key]) => input.key.includes(key as (typeof input.key)[number])),
      ),
      scope,
    ),
    valueSchema: resolveSchema(
      Object.fromEntries(
        Object.entries(input.schema).filter(([key]) => !input.key.includes(key as (typeof input.key)[number])),
      ),
      scope,
    ),
    codegen: resolveTableCodegen(input),
  } as unknown as resolveTable<input, scope>;
}

export function defineTable<input, scope extends Scope = AbiTypeScope>(
  input: validateTable<input, scope>,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveTable<input, scope> {
  validateTable(input, scope);
  return resolveTable(input, scope) as resolveTable<input, scope>;
}

export type getKeySchema<table extends Table> = {
  [fieldName in table["key"][number]]: table["schema"][fieldName];
};

export function getKeySchema<table extends Table>(table: table): getKeySchema<table> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, table.schema[fieldName]])) as getKeySchema<table>;
}

export type getValueSchema<table extends Table> = {
  [fieldName in Exclude<keyof table["schema"], table["key"][number]>]: table["schema"][fieldName];
};

export function getValueSchema<table extends Table>(table: table): getValueSchema<table> {
  return Object.fromEntries(
    Object.entries(table.schema).filter(([fieldName]) => !table.key.includes(fieldName)),
  ) as getValueSchema<table>;
}
