import { Dict, evaluate, narrow } from "@arktype/util";
import { get, hasOwnKey } from "./generics";
import { SchemaInput } from "./schema";
import { AbiType, AbiTypeScope, extendScope } from "./scope";
import { TableInput, resolveTableConfig, validateTableConfig } from "./table";
import { isSchemaAbiType } from "@latticexyz/schema-type";

export type UserTypes = Dict<string, AbiType>;
export type Enums = Dict<string, string[]>;

export type StoreConfigInput<scope extends AbiTypeScope = AbiTypeScope> = {
  namespace?: string;
  tables: StoreTablesConfigInput<scope>;
  userTypes?: UserTypes;
  enums?: Enums;
};

export type StoreTablesConfigInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: TableInput<SchemaInput<scope>, scope>;
};

export type validateStoreTablesConfig<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: validateTableConfig<input[key], scope>;
};

export type resolveStoreTablesConfig<input, scope extends AbiTypeScope = AbiTypeScope> = evaluate<{
  readonly [key in keyof input]: resolveTableConfig<input[key], scope>;
}>;

export function resolveStoreTablesConfig<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: input,
  scope: scope = AbiTypeScope as scope,
): resolveStoreTablesConfig<input, scope> {
  if (typeof input !== "object" || input == null) {
    throw new Error(`Expected tables config, received ${JSON.stringify(input)}`);
  }

  return Object.fromEntries(
    Object.entries(input).map(([key, table]) => [key, resolveTableConfig(table, scope)]),
  ) as resolveStoreTablesConfig<input, scope>;
}

export type scopeWithUserTypes<userTypes, scope extends AbiTypeScope = AbiTypeScope> = UserTypes extends userTypes
  ? scope
  : userTypes extends UserTypes
    ? extendScope<scope, userTypes>
    : scope;

function isUserTypes(userTypes: unknown): userTypes is UserTypes {
  return (
    typeof userTypes === "object" &&
    userTypes != null &&
    Object.values(userTypes).every((type) => isSchemaAbiType(type))
  );
}

export function scopeWithUserTypes<userTypes, scope extends AbiTypeScope = AbiTypeScope>(
  userTypes: userTypes,
  scope: scope = AbiTypeScope as scope,
): scopeWithUserTypes<userTypes, scope> {
  return (isUserTypes(userTypes) ? extendScope(scope, userTypes) : scope) as scopeWithUserTypes<userTypes, scope>;
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
        : input[key];
};

export type resolveEnums<enums> = { readonly [key in keyof enums]: Readonly<enums[key]> };

export type resolveStoreConfig<input> = evaluate<{
  readonly tables: "tables" extends keyof input ? resolveStoreTablesConfig<input["tables"], extendedScope<input>> : {};
  readonly userTypes: "userTypes" extends keyof input
    ? undefined extends input["userTypes"]
      ? UserTypes
      : input["userTypes"]
    : UserTypes;
  readonly enums: "enums" extends keyof input
    ? undefined extends input["enums"]
      ? Enums
      : resolveEnums<input["enums"]>
    : Enums;
  readonly namespace: "namespace" extends keyof input
    ? undefined extends input["namespace"]
      ? ""
      : input["namespace"]
    : "";
}>;

export function resolveStoreConfig<const input>(input: validateStoreConfig<input>): resolveStoreConfig<input> {
  return {
    tables: hasOwnKey(input, "tables") ? resolveStoreTablesConfig(input["tables"], extendedScope(input)) : {},
    userTypes: hasOwnKey(input, "userTypes") ? input["userTypes"] : {},
    enums: hasOwnKey(input, "enums") ? input["enums"] : {},
    namespace: hasOwnKey(input, "namespace") ? input["namespace"] : "",
  } as resolveStoreConfig<input>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedStoreConfig = resolveStoreConfig<StoreConfigInput<any>>;
