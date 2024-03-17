import { conform, evaluate, narrow } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type/internal";
import { Hex } from "viem";
import { get, hasOwnKey } from "./generics";
import { SchemaInput, isSchemaInput, resolveSchema } from "./schema";
import { AbiTypeScope, getStaticAbiTypeKeys } from "./scope";
import { TableCodegenOptions } from "./output";
import { TABLE_CODEGEN_DEFAULTS, TABLE_DEFAULTS } from "./defaults";
import { resourceToHex } from "@latticexyz/common";

export type TableFullInput<
  schema extends SchemaInput<scope> = SchemaInput,
  scope extends AbiTypeScope = AbiTypeScope,
  key extends ValidKeys<schema, scope> = ValidKeys<schema, scope>,
> = {
  schema: schema;
  key: key;
  tableId?: Hex;
  name: string;
  namespace?: string;
  type?: "table" | "offchainTable";
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
  key: unknown,
  schema: schema,
  scope: scope = AbiTypeScope as scope,
): key is ValidKeys<schema, scope> {
  return (
    Array.isArray(key) &&
    key.every(
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
    hasOwnKey(input, "key") &&
    Array.isArray(input["key"])
  );
}

export type validateKeys<validKeys extends PropertyKey, keys> = {
  [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
};

export type validateTableFull<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: key extends "key"
    ? validateKeys<getStaticAbiTypeKeys<conform<get<input, "schema">, SchemaInput<scope>>, scope>, input[key]>
    : key extends "schema"
      ? conform<input[key], SchemaInput<scope>>
      : key extends "name" | "namespace"
        ? narrow<input[key]>
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
}

export type resolveTableCodegen<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
> = {
  [key in keyof TableCodegenOptions]-?: key extends keyof input["codegen"]
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

export function resolveTableCodegen<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
>(input: input, scope: scope): resolveTableCodegen<input, scope> {
  const options = input.codegen;
  return {
    directory: get(options, "directory") ?? TABLE_CODEGEN_DEFAULTS.directory,
    tableIdArgument: get(options, "tableIdArgument") ?? TABLE_CODEGEN_DEFAULTS.tableIdArgument,
    storeArgument: get(options, "storeArgument") ?? TABLE_CODEGEN_DEFAULTS.storeArgument,
    // dataStruct is true if there are at least 2 value fields
    dataStruct: get(options, "dataStruct") ?? Object.keys(input.schema).length - input.key.length > 1,
  } satisfies TableCodegenOptions as resolveTableCodegen<input, scope>;
}

/** @deprecated */
export type tableWithDefaults<
  table extends TableFullInput<SchemaInput<scope>, scope>,
  defaultName extends string,
  defaultNamespace extends string,
  scope extends AbiTypeScope = AbiTypeScope,
> = {
  [key in keyof TableFullInput]-?: undefined extends table[key]
    ? key extends "name"
      ? defaultName
      : key extends "namespace"
        ? defaultNamespace
        : key extends "type"
          ? typeof TABLE_DEFAULTS.type
          : table[key]
    : table[key];
};

/** @deprecated */
export function tableWithDefaults<
  table extends TableFullInput,
  defaultName extends string,
  defaultNamespace extends string,
>(
  table: table,
  defaultName: defaultName,
  defaultNamespace: defaultNamespace,
): tableWithDefaults<table, defaultName, defaultNamespace> {
  return {
    ...table,
    tableId:
      table.tableId ??
      (defaultName
        ? resourceToHex({ type: TABLE_DEFAULTS.type, namespace: defaultNamespace, name: defaultName })
        : undefined),
    name: table.name ?? defaultName,
    namespace: table.namespace ?? defaultNamespace,
    type: table.type ?? TABLE_DEFAULTS.type,
  } as tableWithDefaults<table, defaultName, defaultNamespace>;
}

export type resolveTableFullConfig<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
> = evaluate<{
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
  readonly codegen: resolveTableCodegen<input, scope>;
}>;

export function resolveTableFullConfig<
  input extends TableFullInput<SchemaInput<scope>, scope>,
  scope extends AbiTypeScope = AbiTypeScope,
>(input: validateTableFull<input>, scope: scope = AbiTypeScope as scope): resolveTableFullConfig<input, scope> {
  validateTableFull(input, scope);

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
        Object.entries(input.schema).filter(([key]) => input.key.includes(key as input["key"][number])),
      ),
      scope,
    ),
    valueSchema: resolveSchema(
      Object.fromEntries(
        Object.entries(input.schema).filter(([key]) => !input.key.includes(key as input["key"][number])),
      ),
      scope,
    ),
    codegen: resolveTableCodegen(input, scope),
  } as unknown as resolveTableFullConfig<input, scope>;
}
