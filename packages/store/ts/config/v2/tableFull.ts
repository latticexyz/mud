import { conform, evaluate } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { get, hasOwnKey } from "./generics";
import { SchemaInput, isSchemaInput, resolveSchema } from "./schema";
import { AbiTypeScope, getStaticAbiTypeKeys } from "./scope";
import { TableCodegenOptions } from "./output";
import { CONFIG_DEFAULTS, TABLE_CODEGEN_DEFAULTS, TABLE_DEFAULTS } from "./defaults";
import { resourceToHex } from "@latticexyz/common";

export type TableFullInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  primaryKey extends ValidKeys<schema, scope> = ValidKeys<schema, scope>,
> = {
  schema: schema;
  primaryKey: primaryKey;
  tableId?: Hex;
  type?: "table" | "offchainTable";
  name?: string;
  namespace?: string;
  codegen?: Partial<TableCodegenOptions>;
};

export type ValidKeys<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = readonly [
  getStaticAbiTypeKeys<schema, scope>,
  ...getStaticAbiTypeKeys<schema, scope>[],
];

function getValidKeys<schema extends SchemaInput<scope>, scope extends AbiTypeScope>(
  schema: schema,
  scope: scope = AbiTypeScope as scope,
): ValidKeys<schema, scope> {
  return Object.entries(schema)
    .filter(([, internalType]) => hasOwnKey(scope.types, internalType) && isStaticAbiType(scope.types[internalType]))
    .map(([key]) => key) as unknown as ValidKeys<schema, scope>;
}

export function isValidPrimaryKey<schema extends SchemaInput<scope>, scope extends AbiTypeScope>(
  primaryKey: unknown,
  schema: schema,
  scope: scope = AbiTypeScope as scope,
): primaryKey is ValidKeys<schema, scope> {
  return (
    Array.isArray(primaryKey) &&
    primaryKey.every(
      (key) =>
        hasOwnKey(schema, key) && hasOwnKey(scope.types, schema[key]) && isStaticAbiType(scope.types[schema[key]]),
    )
  );
}

export function isTableFullInput(input: unknown): input is TableFullInput {
  return (
    typeof input === "object" &&
    input !== null &&
    hasOwnKey(input, "schema") &&
    hasOwnKey(input, "primaryKey") &&
    Array.isArray(input["primaryKey"])
  );
}

export type validateKeys<validKeys extends PropertyKey, keys> = {
  [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
};

export type validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: key extends "primaryKey"
    ? validateKeys<getStaticAbiTypeKeys<conform<get<input, "schema">, SchemaInput<scope>>, scope>, input[key]>
    : key extends "schema"
      ? conform<input[key], SchemaInput<scope>>
      : key extends keyof TableFullInput
        ? TableFullInput[key]
        : input[key];
};

export function validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: input,
  scope: scope = AbiTypeScope as scope,
): asserts input is TableFullInput<SchemaInput<scope>, scope> & input {
  if (typeof input !== "object" || input == null) {
    throw new Error(`Expected full table config, got ${JSON.stringify(input)}`);
  }

  if (!hasOwnKey(input, "schema") || !isSchemaInput(input["schema"], scope)) {
    throw new Error("Invalid schema input");
  }

  if (!hasOwnKey(input, "primaryKey") || !isValidPrimaryKey(input["primaryKey"], input["schema"], scope)) {
    throw new Error(
      `Invalid primary key. Expected \`(${getValidKeys(input["schema"], scope)
        .map((item) => `"${String(item)}"`)
        .join(" | ")})[]\`, received \`${
        hasOwnKey(input, "primaryKey") && Array.isArray(input.primaryKey)
          ? `[${input.primaryKey.map((item) => `"${item}"`).join(", ")}]`
          : "undefined"
      }\``,
    );
  }
}

export type resolveTableCodegen<options> = {
  [key in keyof TableCodegenOptions]-?: key extends keyof options
    ? undefined extends options[key]
      ? key extends "dataStruct"
        ? boolean
        : key extends keyof typeof TABLE_CODEGEN_DEFAULTS
          ? (typeof TABLE_CODEGEN_DEFAULTS)[key]
          : never
      : options[key]
    : // dataStruct isn't narrowed, because its value is conditional on the number of value schema fields
      key extends "dataStruct"
      ? boolean
      : key extends keyof typeof TABLE_CODEGEN_DEFAULTS
        ? (typeof TABLE_CODEGEN_DEFAULTS)[key]
        : never;
};

export function resolveTableCodegen<options extends Partial<TableCodegenOptions>>(
  options: options,
  schema: SchemaInput,
): resolveTableCodegen<options> {
  return {
    directory: get(options, "directory") ?? TABLE_CODEGEN_DEFAULTS.directory,
    tableIdArgument: get(options, "tableIdArgument") ?? TABLE_CODEGEN_DEFAULTS.tableIdArgument,
    storeArgument: get(options, "storeArgument") ?? TABLE_CODEGEN_DEFAULTS.storeArgument,
    dataStruct: get(options, "dataStruct") ?? Object.keys(schema).length > 1,
  } satisfies TableCodegenOptions as resolveTableCodegen<options>;
}

export type tableWithDefaults<
  table extends TableFullInput<SchemaInput<scope>, scope>,
  defaultName extends string,
  scope extends AbiTypeScope = AbiTypeScope,
> = {
  [key in keyof TableFullInput]-?: undefined extends table[key]
    ? key extends "name"
      ? defaultName
      : key extends "namespace"
        ? typeof CONFIG_DEFAULTS.namespace
        : key extends "type"
          ? typeof TABLE_DEFAULTS.type
          : table[key]
    : table[key];
};

export function tableWithDefaults<table extends TableFullInput, defaultName extends string>(
  table: table,
  defaultName: defaultName,
): tableWithDefaults<table, defaultName> {
  return {
    ...table,
    tableId:
      table.tableId ??
      (defaultName ? resourceToHex({ type: TABLE_DEFAULTS.type, namespace: "", name: defaultName }) : undefined),
    name: table.name ?? defaultName,
    namespace: table.namespace ?? CONFIG_DEFAULTS.namespace,
    type: table.type ?? TABLE_DEFAULTS.type,
  } as tableWithDefaults<table, defaultName>;
}

export type resolveTableFullConfig<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
> = evaluate<{
  readonly tableId: Hex;
  readonly name: input["name"] extends undefined ? "" : input["name"];
  readonly namespace: input["namespace"] extends undefined ? "" : input["namespace"];
  readonly type: input["type"] extends undefined ? "table" : input["type"];
  readonly primaryKey: Readonly<input["primaryKey"]>;
  readonly schema: resolveSchema<input["schema"], scope>;
  readonly keySchema: resolveSchema<
    {
      readonly [key in input["primaryKey"][number]]: input["schema"][key];
    },
    scope
  >;
  readonly valueSchema: resolveSchema<
    {
      readonly [key in Exclude<keyof input["schema"], input["primaryKey"][number]>]: input["schema"][key];
    },
    scope
  >;
  readonly codegen: resolveTableCodegen<input["codegen"]>;
}>;

export function resolveTableFullConfig<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
>(input: input, scope: scope = AbiTypeScope as scope): resolveTableFullConfig<input, scope> {
  validateTableFull(input, scope);

  return {
    // TODO: require tableId and name as inputs
    tableId: input.tableId ?? ("0x" as Hex),
    name: input.name ?? ("" as const),
    namespace: input.namespace ?? ("" as const),
    type: input.type ?? ("table" as const),
    primaryKey: input["primaryKey"],
    schema: resolveSchema(input["schema"], scope),
    keySchema: resolveSchema(
      Object.fromEntries(
        Object.entries(input["schema"]).filter(([key]) =>
          input["primaryKey"].includes(key as input["primaryKey"][number]),
        ),
      ),
      scope,
    ),
    valueSchema: resolveSchema(
      Object.fromEntries(
        Object.entries(input["schema"]).filter(
          ([key]) => !input["primaryKey"].includes(key as input["primaryKey"][number]),
        ),
      ),
      scope,
    ),
    codegen: resolveTableCodegen(input.codegen ?? {}, input.schema as SchemaInput),
  } as resolveTableFullConfig<input, scope>;
}
