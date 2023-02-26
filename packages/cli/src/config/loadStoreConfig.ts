import { SchemaType, getStaticByteLength } from "@latticexyz/schema-type";
import { z, ZodError } from "zod";
import { fromZodErrorCustom } from "../utils/errors.js";
import { BaseRoute, ObjectName, OrdinaryRoute, ValueName } from "./commonSchemas.js";
import { loadConfig } from "./loadConfig.js";

const TableName = ObjectName;
const KeyName = ValueName;
const ColumnName = ValueName;

const PrimaryKey = z
  .nativeEnum(SchemaType)
  .refine((arg) => getStaticByteLength(arg) > 0, "Primary key must not use dynamic SchemaType");
const PrimaryKeys = z.record(KeyName, PrimaryKey).default({ key: SchemaType.BYTES32 });

const Schema = z
  .record(ColumnName, z.nativeEnum(SchemaType))
  .refine((arg) => Object.keys(arg).length > 0, "Table schema may not be empty");

const FullTable = z
  .object({
    route: OrdinaryRoute.default("/tables"),
    tableIdArgument: z.boolean().default(false),
    primaryKeys: PrimaryKeys,
    schema: Schema,
    dataStruct: z.boolean().optional(),
  })
  .transform((arg) => {
    // default dataStruct value depends on schema's length
    if (Object.keys(arg.schema).length === 1) {
      arg.dataStruct ??= false;
    } else {
      arg.dataStruct ??= true;
    }
    return arg as Omit<typeof arg, "dataStruct"> & Required<Pick<typeof arg, "dataStruct">>;
  });

const DefaultSingleValueTable = z.nativeEnum(SchemaType).transform((schemaType) => {
  return FullTable.parse({
    schema: {
      value: schemaType,
    },
  });
});

export const StoreConfig = z.object({
  baseRoute: BaseRoute.default(""),
  storeImportPath: z.string().default("@latticexyz/store/src/"),
  tables: z.record(TableName, z.union([DefaultSingleValueTable, FullTable])),
});

// zod doesn't preserve doc comments
export interface StoreUserConfig {
  /** The base route prefix for table ids. Default is "" (empty string) */
  baseRoute?: string;
  /** Path for store package imports. Default is "@latticexyz/store/src/" */
  storeImportPath?: string;
  /**
   * Configuration for each table.
   *
   * The key is the table name (capitalized).
   *
   * The value:
   *  - SchemaType for a single-value table (aka ECS component).
   *  - FullTableConfig object for multi-value tables (or for customizable options).
   */
  tables: Record<string, SchemaType | FullTableConfig>;
}

interface FullTableConfig {
  /** Output path for the file, also used to make table id. Default is "tables/" */
  route?: string;
  /** Make methods accept `tableId` argument instead of it being a hardcoded constant. Default is false */
  tableIdArgument?: boolean;
  /** Include a data struct and methods for it. Default is false for 1-column tables; true for multi-column tables. */
  dataStruct?: boolean;
  /** Table's primary key names mapped to their types. Default is `{ key: SchemaType.BYTES32 }` */
  primaryKeys?: Record<string, SchemaType>;
  /** Table's column names mapped to their types. Table name's 1st letter should be lowercase. */
  schema: Record<string, SchemaType>;
}

export type StoreConfig = z.output<typeof StoreConfig>;

export async function loadStoreConfig(configPath?: string) {
  const config = await loadConfig(configPath);

  try {
    return StoreConfig.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "StoreConfig Validation Error");
    } else {
      throw error;
    }
  }
}
