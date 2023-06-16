import { AbiType, AbiTypes, StaticAbiType, StaticAbiTypes, StaticArray } from "@latticexyz/schema-type/deprecated";
import { RefinementCtx, z, ZodIssueCode } from "zod";
import type {
  AsDependent,
  ExtractUserTypes,
  OrDefaults,
  RequireKeys,
  StringForUnion,
} from "@latticexyz/common/type-utils";
import {
  // validation utils
  getDuplicates,
  parseStaticArray,
  STORE_SELECTOR_MAX_LENGTH,
  // config
  MUDCoreUserConfig,
  // schemas
  zObjectName,
  zSelector,
  zUserEnum,
  zValueName,
} from "@latticexyz/config";
import { DEFAULTS, PATH_DEFAULTS, TABLE_DEFAULTS } from "./defaults";

const zTableName = zObjectName;
const zKeyName = zValueName;
const zColumnName = zValueName;
const zUserEnumName = zObjectName;

// Fields can use AbiType or one of user-defined wrapper types
// (user types are refined later, based on the appropriate config options)
const zFieldData = z.string();

export type FieldData<UserTypes extends StringForUnion> = AbiType | StaticArray | UserTypes;

// Primary keys allow only static types
// (user types are refined later, based on the appropriate config options)
const zKeyElementSchema = z.string();
const zKeySchema = z.record(zKeyName, zKeyElementSchema).default(TABLE_DEFAULTS.keySchema);

type KeySchema<StaticUserTypes extends StringForUnion> = StaticAbiType | StaticUserTypes;

/************************************************************************
 *
 *    TABLE SCHEMA
 *
 ************************************************************************/

export type FullSchemaConfig<UserTypes extends StringForUnion = StringForUnion> = Record<string, FieldData<UserTypes>>;
export type ShorthandSchemaConfig<UserTypes extends StringForUnion = StringForUnion> = FieldData<UserTypes>;
export type SchemaConfig<UserTypes extends StringForUnion = StringForUnion> =
  | FullSchemaConfig<UserTypes>
  | ShorthandSchemaConfig<UserTypes>;

export type ExpandSchemaConfig<TSchemaConfig extends SchemaConfig<string>> =
  TSchemaConfig extends ShorthandSchemaConfig<string> ? { value: TSchemaConfig } : TSchemaConfig;

const zFullSchemaConfig = z
  .record(zColumnName, zFieldData)
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

export interface TableConfig<
  UserTypes extends StringForUnion = StringForUnion,
  StaticUserTypes extends StringForUnion = StringForUnion
> {
  /** Output directory path for the file. Default is "tables" */
  directory?: string;
  /** Make methods accept `tableId` argument instead of it being a hardcoded constant. Default is false */
  tableIdArgument?: boolean;
  /** Include methods that accept a manual `IStore` argument. Default is true. */
  storeArgument?: boolean;
  /** Include a data struct and methods for it. Default is false for 1-column tables; true for multi-column tables. */
  dataStruct?: boolean;
  /** Generate only `emitEphemeral` which emits an event without writing to storage. Default is false. */
  ephemeral?: boolean;
  /** Table's key schema names mapped to their types. Default is `{ key: "bytes32" }` */
  keySchema?: Record<string, KeySchema<StaticUserTypes>>;
  /** Table's column names mapped to their types. Table name's 1st letter should be lowercase. */
  schema: SchemaConfig<UserTypes>;
}

export type FullTableConfig<
  UserTypes extends StringForUnion = StringForUnion,
  StaticUserTypes extends StringForUnion = StringForUnion
> = Required<TableConfig<UserTypes, StaticUserTypes>> & {
  schema: FullSchemaConfig<UserTypes>;
};

export interface ExpandTableConfig<T extends TableConfig<string, string>, TableName extends string>
  extends OrDefaults<
    T,
    {
      directory: typeof TABLE_DEFAULTS.directory;
      name: TableName;
      tableIdArgument: typeof TABLE_DEFAULTS.tableIdArgument;
      storeArgument: typeof TABLE_DEFAULTS.storeArgument;
      // dataStruct isn't expanded, because its value is conditional on the number of schema fields
      dataStruct: boolean;
      keySchema: typeof TABLE_DEFAULTS.keySchema;
      ephemeral: typeof TABLE_DEFAULTS.ephemeral;
    }
  > {
  schema: ExpandSchemaConfig<T["schema"]>;
}

const zFullTableConfig = z
  .object({
    directory: z.string().default(TABLE_DEFAULTS.directory),
    name: zSelector.optional(),
    tableIdArgument: z.boolean().default(TABLE_DEFAULTS.tableIdArgument),
    storeArgument: z.boolean().default(TABLE_DEFAULTS.storeArgument),
    dataStruct: z.boolean().optional(),
    keySchema: zKeySchema,
    schema: zSchemaConfig,
    ephemeral: z.boolean().default(TABLE_DEFAULTS.ephemeral),
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

export type TablesConfig<
  UserTypes extends StringForUnion = StringForUnion,
  StaticUserTypes extends StringForUnion = StringForUnion
> = Record<string, TableConfig<UserTypes, StaticUserTypes> | FieldData<UserTypes>>;

export const zTablesConfig = z.record(zTableName, zTableConfig).transform((tables) => {
  // default name depends on tableName
  for (const tableName of Object.keys(tables)) {
    const table = tables[tableName];
    table.name = tableName.slice(0, STORE_SELECTOR_MAX_LENGTH);

    tables[tableName] = table;
  }
  return tables as Record<string, RequireKeys<(typeof tables)[string], "name">>;
});

export type FullTablesConfig<
  UserTypes extends StringForUnion = StringForUnion,
  StaticUserTypes extends StringForUnion = StringForUnion
> = Record<string, FullTableConfig<UserTypes, StaticUserTypes>>;

export type ExpandTablesConfig<T extends TablesConfig<string, string>> = {
  [TableName in keyof T]: T[TableName] extends FieldData<string>
    ? ExpandTableConfig<{ schema: { value: T[TableName] } }, TableName extends string ? TableName : never>
    : T[TableName] extends TableConfig<string, string>
    ? ExpandTableConfig<T[TableName], TableName extends string ? TableName : never>
    : // Weakly typed values get a weakly typed expansion.
      // This shouldn't normally happen within `mudConfig`, but can be manually triggered via `ExpandMUDUserConfig`
      ExpandTableConfig<TableConfig<string, string>, TableName extends string ? TableName : string>;
};

/************************************************************************
 *
 *    USER TYPES
 *
 ************************************************************************/

export type EnumsConfig<EnumNames extends StringForUnion> = never extends EnumNames
  ? {
      /**
       * Enum names mapped to lists of their member names
       *
       * (enums are inferred to be absent)
       */
      enums?: Record<EnumNames, string[]>;
    }
  : StringForUnion extends EnumNames
  ? {
      /**
       * Enum names mapped to lists of their member names
       *
       * (enums aren't inferred - use `mudConfig` or `storeConfig` helper, and `as const` for variables)
       */
      enums?: Record<EnumNames, string[]>;
    }
  : {
      /**
       * Enum names mapped to lists of their member names
       *
       * Enums defined here can be used as types in table schemas/keys
       */
      enums: Record<EnumNames, string[]>;
    };

export type FullEnumsConfig<EnumNames extends StringForUnion> = {
  enums: Record<EnumNames, string[]>;
};

export const zEnumsConfig = z.object({
  enums: z.record(zUserEnumName, zUserEnum).default(DEFAULTS.enums),
});

/************************************************************************
 *
 *    FINAL
 *
 ************************************************************************/

// zod doesn't preserve doc comments
/** MUDCoreUserConfig wrapper to use generics in some options for better type inference */
export type MUDUserConfig<
  T extends MUDCoreUserConfig = MUDCoreUserConfig,
  EnumNames extends StringForUnion = StringForUnion,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>
> = T &
  EnumsConfig<EnumNames> & {
    /**
     * Configuration for each table.
     *
     * The key is the table name (capitalized).
     *
     * The value:
     *  - abi or user type for a single-value table.
     *  - FullTableConfig object for multi-value tables (or for customizable options).
     */
    tables: TablesConfig<AsDependent<StaticUserTypes>, AsDependent<StaticUserTypes>>;
    /** The namespace for table ids. Default is "" (ROOT) */
    namespace?: string;
    /** Path for store package imports. Default is "@latticexyz/store/src/" */
    storeImportPath?: string;
    /** Path to the file where common user types will be generated and imported from. Default is "Types" */
    userTypesPath?: string;
    /** Path to the directory where generated files will be placed. (Default is "codegen") */
    codegenDirectory?: string;
  };

const StoreConfigUnrefined = z
  .object({
    namespace: zSelector.default(DEFAULTS.namespace),
    storeImportPath: z.string().default(PATH_DEFAULTS.storeImportPath),
    tables: zTablesConfig,
    userTypesPath: z.string().default(PATH_DEFAULTS.userTypesPath),
    codegenDirectory: z.string().default(PATH_DEFAULTS.codegenDirectory),
  })
  .merge(zEnumsConfig);

// finally validate global conditions
export const zStoreConfig = StoreConfigUnrefined.superRefine(validateStoreConfig);

export type StoreUserConfig = z.input<typeof zStoreConfig>;
export type StoreConfig = z.output<typeof zStoreConfig>;

// Catchall preserves other plugins' options
export const zPluginStoreConfig = StoreConfigUnrefined.catchall(z.any()).superRefine(validateStoreConfig);

/************************************************************************
 *
 *    HELPERS
 *
 ************************************************************************/

// Validate conditions that check multiple different config options simultaneously
function validateStoreConfig(config: z.output<typeof StoreConfigUnrefined>, ctx: RefinementCtx) {
  // Local table variables must be unique within the table
  for (const table of Object.values(config.tables)) {
    const keySchemaNames = Object.keys(table.keySchema);
    const fieldNames = Object.keys(table.schema);
    const duplicateVariableNames = getDuplicates([...keySchemaNames, ...fieldNames]);
    if (duplicateVariableNames.length > 0) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Field and key names within one table must be unique: ${duplicateVariableNames.join(", ")}`,
      });
    }
  }
  // Global names must be unique
  const tableLibraryNames = Object.keys(config.tables);
  const staticUserTypeNames = Object.keys(config.enums);
  const userTypeNames = staticUserTypeNames;
  const globalNames = [...tableLibraryNames, ...userTypeNames];
  const duplicateGlobalNames = getDuplicates(globalNames);
  if (duplicateGlobalNames.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Table library names, enum names must be globally unique: ${duplicateGlobalNames.join(", ")}`,
    });
  }
  // Table names used for tableId must be unique
  const tableNames = Object.values(config.tables).map(({ name }) => name);
  const duplicateTableNames = getDuplicates(tableNames);
  if (duplicateTableNames.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Table names must be unique: ${duplicateTableNames.join(", ")}`,
    });
  }
  // User types must exist
  for (const table of Object.values(config.tables)) {
    for (const keySchemaType of Object.values(table.keySchema)) {
      validateStaticAbiOrUserType(staticUserTypeNames, keySchemaType, ctx);
    }
    for (const fieldType of Object.values(table.schema)) {
      validateAbiOrUserType(userTypeNames, staticUserTypeNames, fieldType, ctx);
    }
  }
}

function validateAbiOrUserType(
  userTypeNames: string[],
  staticUserTypeNames: string[],
  type: string,
  ctx: RefinementCtx
) {
  if (!(AbiTypes as string[]).includes(type) && !userTypeNames.includes(type)) {
    const staticArray = parseStaticArray(type);
    if (staticArray) {
      validateStaticArray(staticUserTypeNames, staticArray.elementType, staticArray.staticLength, ctx);
    } else {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `${type} is not a valid abi type, and is not defined in userTypes`,
      });
    }
  }
}

function validateStaticAbiOrUserType(staticUserTypeNames: string[], type: string, ctx: RefinementCtx) {
  if (!(StaticAbiTypes as string[]).includes(type) && !staticUserTypeNames.includes(type)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `${type} is not a static type`,
    });
  }
}

function validateStaticArray(
  staticUserTypeNames: string[],
  elementType: string,
  staticLength: number,
  ctx: RefinementCtx
) {
  validateStaticAbiOrUserType(staticUserTypeNames, elementType, ctx);

  if (staticLength === 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Static array length must not be 0`,
    });
  } else if (staticLength >= 2 ** 16) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Static array length must be less than 2**16`,
    });
  }
}
