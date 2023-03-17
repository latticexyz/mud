import { AbiType, AbiTypes, StaticAbiType } from "@latticexyz/schema-type";
import { RefinementCtx, z, ZodIssueCode } from "zod";
import { RequireKeys, StringForUnion } from "../utils/typeUtils.js";
import { ObjectName, Selector, zAbiType, zStaticAbiType, UserEnum, ValueName } from "./commonSchemas.js";
import { getDuplicates } from "./validation.js";

const TableName = ObjectName;
const KeyName = ValueName;
const ColumnName = ValueName;
const UserEnumName = ObjectName;

// Fields can use AbiType or one of user-defined wrapper types
// (user types are refined later, based on the appropriate config options)
const zFieldData = z.union([zAbiType, z.string()]);

type FieldData<UserTypes extends string> = AbiType | UserTypes;

// Primary keys allow only static types
const zPrimaryKey = z.union([zStaticAbiType, z.string()]);
const zPrimaryKeys = z.record(KeyName, zPrimaryKey).default({ key: "bytes32" });

type PrimaryKey<StaticUserTypes extends string> = StaticAbiType | StaticUserTypes;

/************************************************************************
 *
 *    TABLE SCHEMA
 *
 ************************************************************************/

export type FullSchemaConfig<UserTypes extends string> = Record<string, FieldData<UserTypes>>;
export type ShorthandSchemaConfig<UserTypes extends string> = FieldData<UserTypes>;
export type SchemaConfig<UserTypes extends string> = FullSchemaConfig<UserTypes> | ShorthandSchemaConfig<UserTypes>;

const zFullSchemaConfig = z
  .record(ColumnName, zFieldData)
  .refine((arg) => Object.keys(arg).length > 0, "Table schema may not be empty");

const zShorthandSchemaConfig = zFieldData.transform((fieldData) => {
  return zFullSchemaConfig.parse({
    value: fieldData,
  });
});

export const zSchemaConfig = zFullSchemaConfig.or(zShorthandSchemaConfig);

/************************************************************************
 *
 *    TABLE
 *
 ************************************************************************/

export interface TableConfig<UserTypes extends string> {
  /** Output directory path for the file. Default is "tables" */
  directory?: string;
  /**
   * The fileSelector is used with the namespace to register the table and construct its id.
   * The table id will be uint256(bytes32(abi.encodePacked(bytes16(namespace), bytes16(fileSelector)))).
   * Default is "<tableName>"
   * */
  fileSelector?: string;
  /** Make methods accept `tableId` argument instead of it being a hardcoded constant. Default is false */
  tableIdArgument?: boolean;
  /** Include methods that accept a manual `IStore` argument. Default is false. */
  storeArgument?: boolean;
  /** Include a data struct and methods for it. Default is false for 1-column tables; true for multi-column tables. */
  dataStruct?: boolean;
  /** Table's primary key names mapped to their types. Default is `{ key: "bytes32" }` */
  primaryKeys?: Record<string, PrimaryKey<UserTypes>>;
  /** Table's column names mapped to their types. Table name's 1st letter should be lowercase. */
  schema: SchemaConfig<UserTypes>;
}

const zFullTableConfig = z
  .object({
    directory: z.string().default("tables"),
    fileSelector: Selector.optional(),
    tableIdArgument: z.boolean().default(false),
    storeArgument: z.boolean().default(false),
    primaryKeys: zPrimaryKeys,
    schema: zSchemaConfig,
    dataStruct: z.boolean().optional(),
  })
  .transform((arg) => {
    // default dataStruct value depends on schema's length
    if (Object.keys(arg.schema).length === 1) {
      arg.dataStruct ??= false;
    } else {
      arg.dataStruct ??= true;
    }
    return arg as RequireKeys<typeof arg, "dataStruct">;
  });

const zShorthandTableConfig = zFieldData.transform((fieldData) => {
  return zFullTableConfig.parse({
    schema: {
      value: fieldData,
    },
  });
});

export const zTableConfig = zFullTableConfig.or(zShorthandTableConfig);

/************************************************************************
 *
 *    TABLES
 *
 ************************************************************************/

export type TablesConfig<UserTypes extends string> = Record<string, TableConfig<UserTypes> | FieldData<UserTypes>>;

export const zTablesConfig = z.record(TableName, zTableConfig).transform((tables) => {
  // default fileSelector depends on tableName
  for (const tableName of Object.keys(tables)) {
    const table = tables[tableName];
    table.fileSelector ??= tableName;

    tables[tableName] = table;
  }
  return tables as Record<string, RequireKeys<(typeof tables)[string], "fileSelector">>;
});

/************************************************************************
 *
 *    USER TYPES
 *
 ************************************************************************/

export interface UserTypesConfig<EnumNames extends string> {
  /** Path to the file where common types will be generated and imported from. Default is "Types" */
  path?: string;
  /** Enum names mapped to lists of their member names */
  enums?: Record<EnumNames, string[]>;
}

export const zUserTypesConfig = z
  .object({
    path: z.string().default("Types"),
    enums: z.record(UserEnumName, UserEnum).default({}),
  })
  .default({});

/************************************************************************
 *
 *    FINAL
 *
 ************************************************************************/

// zod doesn't preserve doc comments
export interface StoreUserConfig<EnumNames extends StringForUnion = StringForUnion> {
  /** The namespace for table ids. Default is "" (empty string) */
  namespace?: string;
  /** Path for store package imports. Default is "@latticexyz/store/src/" */
  storeImportPath?: string;
  /**
   * Configuration for each table.
   *
   * The key is the table name (capitalized).
   *
   * The value:
   *  - abi or user type for a single-value table (aka ECS component).
   *  - FullTableConfig object for multi-value tables (or for customizable options).
   */
  tables: TablesConfig<EnumNames>;
  /** User-defined types that will be generated and may be used in table schemas instead of abi types */
  userTypes?: UserTypesConfig<EnumNames>;
}

/** Type helper for defining StoreUserConfig */
export function defineStoreUserConfig<EnumNames extends StringForUnion = StringForUnion>(
  config: StoreUserConfig<EnumNames>
) {
  return config;
}

export type StoreConfig = z.output<typeof StoreConfig>;

const StoreConfigUnrefined = z.object({
  namespace: Selector.default(""),
  storeImportPath: z.string().default("@latticexyz/store/src/"),
  tables: zTablesConfig,
  userTypes: zUserTypesConfig,
});

// finally validate global conditions
export const StoreConfig = StoreConfigUnrefined.superRefine(validateStoreConfig);

export function parseStoreConfig(config: unknown) {
  return StoreConfig.parse(config);
}

/************************************************************************
 *
 *    HELPERS
 *
 ************************************************************************/

// Validate conditions that check multiple different config options simultaneously
function validateStoreConfig(config: z.output<typeof StoreConfigUnrefined>, ctx: RefinementCtx) {
  // Local table variables must be unique within the table
  for (const table of Object.values(config.tables)) {
    const primaryKeyNames = Object.keys(table.primaryKeys);
    const fieldNames = Object.keys(table.schema);
    const duplicateVariableNames = getDuplicates([...primaryKeyNames, ...fieldNames]);
    if (duplicateVariableNames.length > 0) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Field and primary key names within one table must be unique: ${duplicateVariableNames.join(", ")}`,
      });
    }
  }
  // Global names must be unique
  const tableNames = Object.keys(config.tables);
  const userTypeNames = Object.keys(config.userTypes.enums);
  const globalNames = [...tableNames, ...userTypeNames];
  const duplicateGlobalNames = getDuplicates(globalNames);
  if (duplicateGlobalNames.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Table, enum names must be globally unique: ${duplicateGlobalNames.join(", ")}`,
    });
  }
  // User types must exist
  for (const table of Object.values(config.tables)) {
    for (const primaryKeyType of Object.values(table.primaryKeys)) {
      validateAbiOrUserType(userTypeNames, primaryKeyType, ctx);
    }
    for (const fieldType of Object.values(table.schema)) {
      validateAbiOrUserType(userTypeNames, fieldType, ctx);
    }
  }
}

function validateAbiOrUserType(userTypeNames: string[], type: string, ctx: RefinementCtx) {
  if (!(AbiTypes as string[]).includes(type) && !userTypeNames.includes(type)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `${type} is not a valid abi type, and is not defined in userTypes`,
    });
  }
}
