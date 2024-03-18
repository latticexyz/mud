import { ErrorMessage, evaluate, narrow } from "@arktype/util";
import { get, hasOwnKey, isObject, mergeIfUndefined } from "./generics";
import { resolveTable, validateTable } from "./table";
import { AbiTypeScope, Scope, extendScope } from "./scope";
import { isSchemaAbiType } from "@latticexyz/schema-type/internal";
import { UserTypes, Enums, CodegenOptions } from "./output";
import { CODEGEN_DEFAULTS, CONFIG_DEFAULTS } from "./defaults";
import { mapObject } from "@latticexyz/common/utils";
import { StoreInput, TablesInput } from "./input";

export type validateTables<tables, scope extends Scope = AbiTypeScope> = {
  [key in keyof tables]: tables[key] extends object
    ? validateTable<tables[key], scope>
    : ErrorMessage<`Expected full table config.`>;
};

export function validateTables<scope extends Scope = AbiTypeScope>(
  input: unknown,
  scope: scope,
): asserts input is TablesInput {
  if (isObject(input)) {
    for (const table of Object.values(input)) {
      validateTable(table, scope);
    }
    return;
  }
  throw new Error(`Expected store config, received ${JSON.stringify(input)}`);
}

export type resolveTables<tables, scope extends Scope = AbiTypeScope> = evaluate<{
  readonly [key in keyof tables]: resolveTable<mergeIfUndefined<tables[key], { name: key }>, scope>;
}>;

export function resolveTables<tables, scope extends Scope = AbiTypeScope>(
  tables: tables,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveTables<tables, scope> {
  validateTables(tables, scope);

  if (!isObject(tables)) {
    throw new Error(`Expected tables config, received ${JSON.stringify(tables)}`);
  }

  return Object.fromEntries(
    Object.entries(tables).map(([key, table]) => {
      return [key, resolveTable(mergeIfUndefined(table, { name: key }) as validateTable<typeof table, scope>, scope)];
    }),
  ) as unknown as resolveTables<tables, scope>;
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

export type validateStore<store> = {
  [key in keyof store]: key extends "tables"
    ? validateTables<store[key], extendedScope<store>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<store[key]>
        : key extends keyof StoreInput
          ? StoreInput[key]
          : never;
};

export function validateStore(store: unknown): asserts store is StoreInput {
  const scope = extendedScope(store);
  if (hasOwnKey(store, "tables") && isObject(store.tables)) {
    for (const key of Object.keys(store.tables)) {
      validateTable(get(store.tables, key), scope);
    }
  }
}

export type resolveEnums<enums> = { readonly [key in keyof enums]: Readonly<enums[key]> };

export type resolveCodegen<codegen> = {
  [key in keyof CodegenOptions]: key extends keyof codegen ? codegen[key] : (typeof CODEGEN_DEFAULTS)[key];
};

export function resolveCodegen<codegen>(codegen: codegen): resolveCodegen<codegen> {
  return Object.fromEntries(
    Object.entries(CODEGEN_DEFAULTS).map(([key, defaultValue]) => [key, get(codegen, key) ?? defaultValue]),
  ) as resolveCodegen<codegen>;
}

export type resolveStore<store> = evaluate<{
  readonly tables: "tables" extends keyof store
    ? resolveTables<
        {
          [key in keyof store["tables"]]: mergeIfUndefined<
            store["tables"][key],
            { namespace: get<store, "namespace"> }
          >;
        },
        extendedScope<store>
      >
    : {};
  readonly userTypes: "userTypes" extends keyof store ? store["userTypes"] : {};
  readonly enums: "enums" extends keyof store ? resolveEnums<store["enums"]> : {};
  readonly namespace: "namespace" extends keyof store ? store["namespace"] : (typeof CONFIG_DEFAULTS)["namespace"];
  readonly codegen: "codegen" extends keyof store ? resolveCodegen<store["codegen"]> : resolveCodegen<{}>;
}>;

export function resolveStore<const store>(store: validateStore<store>): resolveStore<store> {
  validateStore(store);

  return {
    tables: resolveTables(
      mapObject(store.tables ?? {}, (table) => mergeIfUndefined(table, { namespace: store.namespace })),
      extendedScope(store),
    ),
    userTypes: store.userTypes ?? {},
    enums: store.enums ?? {},
    namespace: store.namespace ?? CONFIG_DEFAULTS["namespace"],
    codegen: resolveCodegen(store.codegen),
  } as unknown as resolveStore<store>;
}
