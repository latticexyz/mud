import { OrDefault, OrDefaults, StringForUnion } from "@latticexyz/common/type-utils";
import { FieldData, SchemaConfig } from "./schema";
import { StaticAbiType } from "@latticexyz/schema-type";
import { TABLE_DEFAULTS, DEFAULTS } from "../defaults";

type PrimaryKey<StaticUserTypes extends StringForUnion> = StaticAbiType | StaticUserTypes;

export interface TableConfig<
  UserTypes extends StringForUnion = StringForUnion,
  StaticUserTypes extends StringForUnion = StringForUnion
> {
  /** Output directory path for the file. Default is "tables" */
  directory?: string;
  /**
   * The name is used with the namespace to register the table and construct its id.
   * The table id will be uint256(bytes32(abi.encodePacked(bytes16(namespace), bytes16(name)))).
   * Default is "<tableName>"
   * */
  name?: string;
  /** Make methods accept `tableId` argument instead of it being a hardcoded constant. Default is false */
  tableIdArgument?: boolean;
  /** Include methods that accept a manual `IStore` argument. Default is true. */
  storeArgument?: boolean;
  /** Include a data struct and methods for it. Default is false for 1-column tables; true for multi-column tables. */
  dataStruct?: boolean;
  /** Table's primary key names mapped to their types. Default is `{ key: "bytes32" }` */
  primaryKeys?: Record<string, PrimaryKey<StaticUserTypes>>;
  /** Table's column names mapped to their types. Table name's 1st letter should be lowercase. */
  schema: SchemaConfig<UserTypes>;
}

export type TablesConfig<
  UserTypes extends StringForUnion = StringForUnion,
  StaticUserTypes extends StringForUnion = StringForUnion
> = {
  /**
   * Configuration for each table.
   *
   * The key is the table name (capitalized).
   *
   * The value:
   *  - abi or user type for a single-value table.
   *  - FullTableConfig object for multi-value tables (or for customizable options).
   */
  tables: Record<string, TableConfig<UserTypes, StaticUserTypes> | FieldData<UserTypes>>;
  /** The namespace for table ids. Default is "" (empty string) */
  namespace?: string;
};

// Expand a shorthand table config to a full table config with defaults
export type ExpandedTableConfig<C extends TableConfig | FieldData> = C extends TableConfig
  ? OrDefaults<Omit<C, "schema" | "primaryKeys">, typeof TABLE_DEFAULTS> & {
      schema: C["schema"];
      primaryKeys: C["primaryKeys"];
    }
  : typeof TABLE_DEFAULTS & { schema: { value: C } };

// Expand a shorthand tables config to a full tables config with defaults
export type ExpandedTablesConfig<C extends TablesConfig> = {
  namespace: OrDefault<C["namespace"], typeof DEFAULTS.namespace>;
  tables: {
    // Map every shorthand table config to a fully expanded table config
    [key in keyof C["tables"]]: ExpandedTableConfig<C["tables"][key]>;
  };
};
