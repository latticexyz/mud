import { SchemaType, getStaticByteLength } from "@latticexyz/schema-type";
import { RefinementCtx, z, ZodIssueCode } from "zod";
import { BaseRoute, ObjectName, OrdinaryRoute, UserEnum, ValueName } from "./commonSchemas.js";
import { getDuplicates } from "./validation.js";

const TableName = ObjectName;
const KeyName = ValueName;
const ColumnName = ValueName;
const UserEnumName = ObjectName;

const PrimaryKey = z
  .nativeEnum(SchemaType)
  .refine((arg) => getStaticByteLength(arg) > 0, "Primary key must not use dynamic SchemaType");
const PrimaryKeys = z.record(KeyName, PrimaryKey).default({ key: SchemaType.BYTES32 });

const Schema = z
  .record(ColumnName, z.nativeEnum(SchemaType))
  .refine((arg) => Object.keys(arg).length > 0, "Table schema may not be empty");

const FullTable = z
  .object({
    directory: OrdinaryRoute.default("/tables"),
    route: BaseRoute.optional(),
    tableIdArgument: z.boolean().default(false),
    storeArgument: z.boolean().default(false),
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
    return arg as RequiredKeys<typeof arg, "dataStruct">;
  });

const DefaultSingleValueTable = z.nativeEnum(SchemaType).transform((schemaType) => {
  return FullTable.parse({
    schema: {
      value: schemaType,
    },
  });
});

const TablesRecord = z.record(TableName, z.union([DefaultSingleValueTable, FullTable])).transform((tables) => {
  // default route depends on tableName
  for (const tableName of Object.keys(tables)) {
    const table = tables[tableName];
    table.route ??= `/${tableName}`;

    tables[tableName] = table;
  }
  return tables as Record<string, RequiredKeys<typeof tables[string], "route">>;
});

const StoreConfigUnrefined = z.object({
  baseRoute: BaseRoute.default(""),
  storeImportPath: z.string().default("@latticexyz/store/src/"),
  tables: TablesRecord,
  userTypes: z
    .object({
      path: OrdinaryRoute.default("/types"),
      enums: z.record(UserEnumName, UserEnum).default({}),
    })
    .default({}),
});
// finally validate global conditions
export const StoreConfig = StoreConfigUnrefined.superRefine(validateStoreConfig);

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
  /** User-defined types that will be generated and may be used in table schemas instead of `SchemaType` */
  userTypes?: UserTypesConfig;
}

interface FullTableConfig {
  /** Output directory path for the file. Default is "/tables" */
  directory?: string;
  /** Route is used to register the table and construct its id. The table id will be keccak256(concat(baseRoute,route)). Default is "/<tableName>" */
  route?: string;
  /** Make methods accept `tableId` argument instead of it being a hardcoded constant. Default is false */
  tableIdArgument?: boolean;
  /** Include methods that accept a manual `IStore` argument. Default is false. */
  storeArgument?: boolean;
  /** Include a data struct and methods for it. Default is false for 1-column tables; true for multi-column tables. */
  dataStruct?: boolean;
  /** Table's primary key names mapped to their types. Default is `{ key: SchemaType.BYTES32 }` */
  primaryKeys?: Record<string, SchemaType>;
  /** Table's column names mapped to their types. Table name's 1st letter should be lowercase. */
  schema: Record<string, SchemaType>;
}

interface UserTypesConfig {
  /** Path to the file where common types will be generated and imported from. Default is "/types" */
  path?: string;
  /** Enum names mapped to lists of their member names */
  enums?: Record<string, string[]>;
}

export type StoreConfig = z.output<typeof StoreConfig>;

export async function parseStoreConfig(config: unknown) {
  return StoreConfig.parse(config);
}

// Validate conditions that check multiple different config options simultaneously
function validateStoreConfig(config: z.output<typeof StoreConfigUnrefined>, ctx: RefinementCtx) {
  // global names must be unique
  const tableNames = Object.keys(config.tables);
  const enumNames = Object.keys(config.userTypes.enums);
  const allNames = [...tableNames, ...enumNames];
  const duplicateGlobalNames = getDuplicates(allNames);
  if (duplicateGlobalNames.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Table and enum names must be globally unique: ${duplicateGlobalNames.join(", ")}`,
    });
  }
}

type RequiredKeys<T extends Record<string, unknown>, P extends string> = T & Required<Pick<T, P>>;