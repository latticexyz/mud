import { Dict, evaluate, narrow } from "@arktype/util";
import { SchemaInput } from "./schema";
import { AbiType, AbiTypeScope, extendScope } from "./scope";
import { TableInput, resolveTableConfig, validateTableConfig } from "./table";
import { get } from "./generics";

export type UserTypes = Dict<string, AbiType>;
export type Enums = Dict<string, string[]>;

export type StoreConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = {
  namespace: string;
  tables: StoreTablesConfigInput<scopeWithUserTypes<userTypes>>;
  userTypes?: userTypes;
  enums?: enums;
};

export type StoreTablesConfigInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: TableInput<SchemaInput<scope>, scope>;
};

export type validateStoreTablesConfig<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: validateTableConfig<input[key], scope>;
};

export type resolveStoreTablesConfig<input, scope extends AbiTypeScope = AbiTypeScope> = evaluate<{
  [key in keyof input]: resolveTableConfig<input[key], scope>;
}>;

type scopeWithUserTypes<userTypes, scope extends AbiTypeScope = AbiTypeScope> = UserTypes extends userTypes
  ? scope
  : userTypes extends UserTypes
    ? extendScope<scope, userTypes>
    : scope;

type scopeWithEnums<enums, scope extends AbiTypeScope = AbiTypeScope> = Enums extends enums
  ? scope
  : enums extends Enums
    ? extendScope<scope, { [key in keyof enums]: "uint8" }>
    : scope;

export type validateStoreConfig<input> = {
  [key in keyof input]: key extends "tables"
    ? validateStoreTablesConfig<
        input[key],
        scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>
      >
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<input[key]>
        : input[key];
};

export type resolveStoreConfig<input> = evaluate<{
  [key in keyof input]: key extends "tables"
    ? resolveStoreTablesConfig<
        input[key],
        scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>
      >
    : input[key];
}>;

export function resolveStoreConfig<input>(input: validateStoreConfig<input>): resolveStoreConfig<input> {
  // TODO: runtime implementation
  return {} as never;
}
