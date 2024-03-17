import { evaluate, narrow } from "@arktype/util";
import { get, isObject } from "./generics";
import { SchemaInput } from "./schema";
import { TableInput, resolveTable, validateTableConfig } from "./shorthand/table";
import { AbiTypeScope, extendScope } from "./scope";
import { isSchemaAbiType } from "@latticexyz/schema-type/internal";
import { UserTypes, Enums, CodegenOptions } from "./output";
import { isTableShorthandInput, resolveTableShorthand, validateTableShorthand } from "./shorthand/tableShorthand";
import { CODEGEN_DEFAULTS, CONFIG_DEFAULTS } from "./defaults";
import { mapObject } from "@latticexyz/common/utils";

export type StoreConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = {
  namespace?: string;
  tables: StoreTablesConfigInput<scopeWithUserTypes<userTypes>>;
  userTypes?: userTypes;
  enums?: enums;
  codegen?: Partial<CodegenOptions>;
};

export type StoreTablesConfigInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: TableInput<SchemaInput<scope>, scope>;
};

export type validateStoreTablesConfig<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: validateTableConfig<input[key], scope>;
};

export function validateStoreTablesConfig<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope,
): asserts input is StoreTablesConfigInput {
  if (isObject(input)) {
    for (const table of Object.values(input)) {
      validateTableConfig(table, scope);
    }
    return;
  }
  throw new Error(`Expected store config, received ${JSON.stringify(input)}`);
}

export type resolveStoreTablesConfig<
  input,
  scope extends AbiTypeScope = AbiTypeScope,
  defaultNamespace extends string = typeof CONFIG_DEFAULTS.namespace,
> = evaluate<{
  // TODO: we currently can't apply `tableWithDefaults` here because the config could be a shorthand here
  readonly [key in keyof input]: resolveTable<input[key], scope, key & string, defaultNamespace>;
}>;

export function resolveStoreTablesConfig<
  input,
  scope extends AbiTypeScope = AbiTypeScope,
  defaultNamespace extends string = typeof CONFIG_DEFAULTS.namespace,
>(
  input: input,
  scope: scope = AbiTypeScope as scope,
  // TODO: ideally the namespace would be passed in with the table input from higher levels
  // but this is currently not possible since the table input could be a shorthand
  defaultNamespace: defaultNamespace = CONFIG_DEFAULTS.namespace as defaultNamespace,
): resolveStoreTablesConfig<input, scope, defaultNamespace> {
  if (typeof input !== "object" || input == null) {
    throw new Error(`Expected tables config, received ${JSON.stringify(input)}`);
  }

  return Object.fromEntries(
    Object.entries(input).map(([key, table]) => {
      const fullInput = isTableShorthandInput(table, scope)
        ? resolveTableShorthand(table as validateTableShorthand<typeof table, scope>, scope)
        : table;

      return [key, resolveTableConfig(fullInput, scope, key, defaultNamespace)];
    }),
  ) as unknown as resolveStoreTablesConfig<input, scope, defaultNamespace>;
}

type extractInternalType<userTypes extends UserTypes> = { [key in keyof userTypes]: userTypes[key]["type"] };

function extractInternalType<userTypes extends UserTypes>(userTypes: userTypes): extractInternalType<userTypes> {
  return mapObject(userTypes, (userType) => userType.type);
}

export type scopeWithUserTypes<userTypes, scope extends AbiTypeScope = AbiTypeScope> = UserTypes extends userTypes
  ? scope
  : userTypes extends UserTypes
    ? extendScope<scope, extractInternalType<userTypes>>
    : scope;

function isUserTypes(userTypes: unknown): userTypes is UserTypes {
  return (
    typeof userTypes === "object" &&
    userTypes != null &&
    Object.values(userTypes).every((userType) => isSchemaAbiType(userType.type))
  );
}

export function scopeWithUserTypes<userTypes, scope extends AbiTypeScope = AbiTypeScope>(
  userTypes: userTypes,
  scope: scope = AbiTypeScope as scope,
): scopeWithUserTypes<userTypes, scope> {
  return (isUserTypes(userTypes) ? extendScope(scope, extractInternalType(userTypes)) : scope) as scopeWithUserTypes<
    userTypes,
    scope
  >;
}

function isEnums(enums: unknown): enums is Enums {
  return (
    typeof enums === "object" &&
    enums != null &&
    Object.values(enums).every((item) => Array.isArray(item) && item.every((element) => typeof element === "string"))
  );
}

export type scopeWithEnums<enums, scope extends AbiTypeScope = AbiTypeScope> = Enums extends enums
  ? scope
  : enums extends Enums
    ? extendScope<scope, { [key in keyof enums]: "uint8" }>
    : scope;

export function scopeWithEnums<enums, scope extends AbiTypeScope = AbiTypeScope>(
  enums: enums,
  scope: scope = AbiTypeScope as scope,
): scopeWithEnums<enums, scope> {
  if (isEnums(enums)) {
    const enumScope = Object.fromEntries(Object.keys(enums).map((key) => [key, "uint8" as const]));
    return extendScope(scope, enumScope) as scopeWithEnums<enums, scope>;
  }
  return scope as scopeWithEnums<enums, scope>;
}

export type extendedScope<input> = scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>;

export function extendedScope<input>(input: input): extendedScope<input> {
  return scopeWithEnums(get(input, "enums"), scopeWithUserTypes(get(input, "userTypes")));
}

export type validateStoreConfig<input> = {
  [key in keyof input]: key extends "tables"
    ? validateStoreTablesConfig<input[key], extendedScope<input>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<input[key]>
        : key extends keyof StoreConfigInput
          ? StoreConfigInput[key]
          : input[key];
};

export type resolveEnums<enums> = { readonly [key in keyof enums]: Readonly<enums[key]> };

export type resolveCodegen<options> = {
  [key in keyof CodegenOptions]: key extends keyof options ? options[key] : (typeof CODEGEN_DEFAULTS)[key];
};

export function resolveCodegen<options>(options: options): resolveCodegen<options> {
  return Object.fromEntries(
    Object.entries(CODEGEN_DEFAULTS).map(([key, defaultValue]) => [key, get(options, key) ?? defaultValue]),
  ) as resolveCodegen<options>;
}

export type resolveStoreConfig<input> = evaluate<{
  readonly tables: "tables" extends keyof input
    ? resolveStoreTablesConfig<input["tables"], extendedScope<input>, get<input, "namespace"> & string>
    : {};
  readonly userTypes: "userTypes" extends keyof input ? input["userTypes"] : {};
  readonly enums: "enums" extends keyof input ? resolveEnums<input["enums"]> : {};
  readonly namespace: "namespace" extends keyof input ? input["namespace"] : (typeof CONFIG_DEFAULTS)["namespace"];
  readonly codegen: "codegen" extends keyof input ? resolveCodegen<input["codegen"]> : resolveCodegen<{}>;
}>;

export function resolveStoreConfig<const input>(input: validateStoreConfig<input>): resolveStoreConfig<input> {
  return {
    tables: resolveStoreTablesConfig(get(input, "tables") ?? {}, extendedScope(input), get(input, "namespace")),
    userTypes: get(input, "userTypes") ?? {},
    enums: get(input, "enums") ?? {},
    namespace: get(input, "namespace") ?? CONFIG_DEFAULTS["namespace"],
    codegen: resolveCodegen(get(input, "codegen")),
  } as resolveStoreConfig<input>;
}
