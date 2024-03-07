import { Dict, evaluate } from "@arktype/util";
import { SchemaInput } from "./schema";
import { AbiType, AbiTypeScope, extendScope } from "./scope";
import { TableInput, resolveTableConfig, validateTableConfig } from "./table";
import { get } from "./generics";

type UserTypes = Dict<string, AbiType>;
type Enums = Dict<string, string[]>;

export type StoreConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = {
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

// Sometimes for TS to handle a tuple correctly, nesting the mapped type in a
// `[...{}]` can help. It's also generally good if you're able to add a
// parameter like `string[]` to an internal type to do that since you're
// checking it in validateEnums anyways
type validateLiteralTuple<tuple extends string[]> = [...{ [index in keyof tuple]: tuple[index] }];

type validateEnums<enums> = enums extends Enums
  ? {
      [key in keyof enums]: validateLiteralTuple<enums[key]>;
    }
  : Enums;

export type validateStoreConfig<input> = {
  [key in keyof input]: key extends "tables"
    ? validateStoreTablesConfig<
        input[key],
        scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>
      >
    : key extends "userTypes"
    ? UserTypes
    : key extends "enums"
    ? validateEnums<input[key]>
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
