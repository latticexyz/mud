import { conform, narrow } from "./generics";
import { Schema } from "./schema";
import { TableConfigInput, ValidKeys, inferSchema, resolveTableConfig, validateTableConfig } from "./table";

export interface StoreConfigInput<schema extends Schema = Schema> {
  tables: StoreTablesConfigInput<schema>;
}

export interface StoreTablesConfigInput<schema extends Schema = Schema> {
  [key: string]: TableConfigInput<schema>;
}

export type validateStoreConfig2<input extends StoreConfigInput> = {
  tables: {
    [key in keyof input["tables"]]: validateTableConfig<input["tables"][key], inferSchema<input["tables"][key]>>;
  };
};

export type validateStoreConfig<input extends StoreConfigInput, schema extends Schema> = conform<
  input,
  StoreConfigInput<schema>
>;

export type resolveStoreConfig<input extends StoreConfigInput> = {
  tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key]> };
};

export function resolveStoreConfig<input extends StoreConfigInput>(
  input: validateStoreConfig<input, inferSchema<input["tables"][keyof input["tables"]]>>
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

type schema = inferSchema<input[keyof input]>;

// TODO: How can I constrain StoreConfigInput in a way where each table
// has a different schema and the keys of each table match the corresponding schema,
// without requiring a global union
type validKeys = ValidKeys<schema>;
