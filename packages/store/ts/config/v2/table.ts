import { ErrorMessage, conform, evaluate, narrow, requiredKeyOf } from "@arktype/util";
import { isStaticAbiType } from "@latticexyz/schema-type/internal";
import { Hex } from "viem";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { resolveSchema, validateSchema } from "./schema";
import { AbiTypeScope, Scope, getStaticAbiTypeKeys } from "./scope";
import { TableCodegen } from "./output";
import { TABLE_CODEGEN_DEFAULTS, TABLE_DEFAULTS, TABLE_DEPLOY_DEFAULTS } from "./defaults";
import { resourceToHex } from "@latticexyz/common";
import { SchemaInput, TableInput } from "./input";

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
    .map(([key]) => key) as never;
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

export type validateKeys<validKeys extends PropertyKey, keys> = keys extends readonly string[]
  ? {
      readonly [i in keyof keys]: keys[i] extends validKeys ? keys[i] : validKeys;
    }
  : readonly string[];

export type ValidateTableOptions = { inStoreContext: boolean };

export type requiredTableKey<inStoreContext extends boolean> = Exclude<
  requiredKeyOf<TableInput>,
  inStoreContext extends true ? "name" | "namespace" : ""
>;

export type validateTable<
  input,
  scope extends Scope = AbiTypeScope,
  options extends ValidateTableOptions = { inStoreContext: false },
> = {
  [key in keyof input | requiredTableKey<options["inStoreContext"]>]: key extends "key"
    ? validateKeys<getStaticAbiTypeKeys<conform<get<input, "schema">, SchemaInput>, scope>, get<input, key>>
    : key extends "schema"
      ? validateSchema<get<input, key>, scope>
      : key extends "name" | "namespace"
        ? options["inStoreContext"] extends true
          ? ErrorMessage<"Overrides of `name` and `namespace` are not allowed for tables in a store config">
          : key extends keyof input
            ? narrow<input[key]>
            : never
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
          : String(get(input, "key"))
      }\``,
    );
  }

  if ((options.inStoreContext && hasOwnKey(input, "name")) || hasOwnKey(input, "namespace")) {
    throw new Error("Overrides of `name` and `namespace` are not allowed for tables in a store config.");
  }
}

export type resolveTableCodegen<input extends TableInput> = evaluate<{
  [key in keyof TableCodegen]-?: key extends keyof input["codegen"]
    ? undefined extends input["codegen"][key]
      ? key extends "dataStruct"
        ? boolean
        : key extends keyof TABLE_CODEGEN_DEFAULTS
          ? TABLE_CODEGEN_DEFAULTS[key]
          : never
      : input["codegen"][key]
    : // dataStruct isn't narrowed, because its value is conditional on the number of value schema fields
      key extends "dataStruct"
      ? boolean
      : key extends keyof TABLE_CODEGEN_DEFAULTS
        ? TABLE_CODEGEN_DEFAULTS[key]
        : never;
}>;

export function resolveTableCodegen<input extends TableInput>(input: input): resolveTableCodegen<input> {
  const options = input.codegen;
  return {
    outputDirectory: get(options, "outputDirectory") ?? TABLE_CODEGEN_DEFAULTS.outputDirectory,
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
      readonly codegen: resolveTableCodegen<input>;
      readonly deploy: mergeIfUndefined<
        undefined extends input["deploy"] ? {} : input["deploy"],
        TABLE_DEPLOY_DEFAULTS
      >;
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
    codegen: resolveTableCodegen(input),
    deploy: mergeIfUndefined(input.deploy ?? {}, TABLE_DEPLOY_DEFAULTS),
  } as never;
}

export function defineTable<input, scope extends Scope = AbiTypeScope>(
  input: validateTable<input, scope>,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveTable<input, scope> {
  validateTable(input, scope);
  return resolveTable(input, scope) as never;
}
