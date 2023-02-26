import { SchemaType } from "@latticexyz/schema-type";
import { z, ZodError } from "zod";
import { fromZodErrorCustom } from "../utils/errors.js";
import { BaseRoute, ObjectName, OrdinaryRoute, ValueName } from "./commonSchemas.js";
import { loadConfig } from "./loadConfig.js";

const TableName = ObjectName;
const KeyName = ValueName;
const ColumnName = ValueName;

export const StoreConfig = z.object({
  baseRoute: BaseRoute.default(""),
  storeImportPath: z.string().default("@latticexyz/store/src/"),
  tables: z.record(
    TableName,
    z.object({
      route: OrdinaryRoute.default("/tables"),
      schemaMode: z.boolean().default(false),
      disableComponentMode: z.boolean().default(false),
      keyTuple: z.array(KeyName).default(["key"]),
      schema: z.record(ColumnName, z.nativeEnum(SchemaType)),
    })
  ),
});

// zod doesn't preserve doc comments
export interface StoreUserConfig {
  /** The base route prefix for table ids. Default is "" (empty string) */
  baseRoute?: string;
  /** Path for store package imports. Default is "@latticexyz/store/src/" */
  storeImportPath?: string;
  /** Configuration for each table. The keys are table names, 1st letter should be uppercase. */
  tables: Record<
    string,
    {
      /** Output path for the file, also used to make table id. Default is "tables/" */
      route?: string;
      /** Make methods accept `_tableId` argument instead of it being hardcoded. Default is false */
      schemaMode?: boolean;
      /** If the table has only 1 column, keep record and field methods separate. Default is false  */
      disableComponentMode?: boolean;
      /** List of names for the table's keys. Default is ["key"] */
      keyTuple?: string[];
      /** Table's columns. The keys are column names, 1st letter should be lowercase. */
      schema: Record<string, SchemaType>;
    }
  >;
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
