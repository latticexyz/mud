import { Dict } from "@arktype/util";
import { SchemaInput } from "./schema";
import { AbiType, AbiTypeScope, extendScope } from "./scope";
import { TableInput, resolveTableConfig, validateTableConfig } from "./table";
import { get } from "./generics";

type UserTypes = Dict<string, AbiType>;

export interface StoreConfigInput<userTypes extends UserTypes = UserTypes> {
  tables: StoreTablesConfigInput<scopeWithUserTypes<userTypes>>;
  userTypes?: userTypes;
}

export interface StoreTablesConfigInput<scope extends AbiTypeScope = AbiTypeScope> {
  [key: string]: TableInput<SchemaInput<scope>, scope>;
}

type scopeWithUserTypes<userTypes> = UserTypes extends userTypes
  ? AbiTypeScope
  : userTypes extends UserTypes
  ? extendScope<AbiTypeScope, userTypes>
  : AbiTypeScope;

export type validateStoreTablesConfig<input, userTypes = undefined> = {
  [key in keyof input]: validateTableConfig<input[key], scopeWithUserTypes<userTypes>>;
};

export type validateStoreConfig<input> = {
  [key in keyof input]: key extends "tables"
    ? validateStoreTablesConfig<input[key], get<input, "userTypes">>
    : key extends "userTypes"
    ? UserTypes
    : input[key];
};

export type resolveStoreTablesConfig<input, userTypes = undefined> = {
  [key in keyof input]: resolveTableConfig<input[key], scopeWithUserTypes<userTypes>>;
};

export type resolveStoreConfig<input> = {
  [key in keyof input]: key extends "tables"
    ? resolveStoreTablesConfig<input[key], get<input, "userTypes">>
    : input[key];
};

export function resolveStoreConfig<input>(input: validateStoreConfig<input>): resolveStoreConfig<input> {
  return {} as never;
}
