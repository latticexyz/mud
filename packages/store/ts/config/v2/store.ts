import { conform, narrow } from "./generics";
import { Schema } from "./schema";
import {
  TableConfigInput,
  TableFullConfigInput,
  ValidKeys,
  inferSchema,
  resolveTableConfig,
  validateTableConfig,
} from "./table";

export interface StoreConfigInput {
  tables: StoreTablesConfigInput;
}

export interface StoreTablesConfigInput {
  [key: string]: TableConfigInput;
}

export type validateStoreTablesConfig<input extends StoreTablesConfigInput> = conform<
  input,
  { [key in keyof input]: TableFullConfigInput<inferSchema<input[key]>> }
>;

export type validateStoreConfig<input extends StoreConfigInput> = conform<
  input,
  { tables: validateStoreTablesConfig<input["tables"]> }
>;

export type resolveStoreConfig<input extends StoreConfigInput> = {
  tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key]> };
};

export function resolveStoreConfig<input extends StoreConfigInput>(
  input: validateStoreConfig<input>
): resolveStoreConfig<input> {
  return {} as never;
}

type input = {
  First: {
    schema: {
      firstKey: "address";
      firstName: "string";
      firstAge: "uint256";
    };
    keys: ["firstKey", "firstAge"];
  };
  Second: {
    schema: {
      secondKey: "address";
      secondName: "string";
      secondAge: "uint256";
    };
    keys: ["firstKey", "firstAge"];
  };
};

type test = { [key in keyof input]: TableFullConfigInput<input[key]["schema"]> };
