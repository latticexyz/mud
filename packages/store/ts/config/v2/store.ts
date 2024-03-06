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
  [k in keyof input]: k extends "tables"
    ? validateStoreTablesConfig<input[k], get<input, "userTypes">>
    : k extends "userTypes"
    ? UserTypes
    : input[k];
};

export type resolveStoreConfig<input, scope extends AbiTypeScope = AbiTypeScope> = input extends StoreConfigInput
  ? {
      tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key], scope> };
    }
  : never;

export function resolveStoreConfig<input>(input: validateStoreConfig<input>): resolveStoreConfig<input> {
  return {} as never;
}
