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
  STORE_NAME_MAX_LENGTH,
  // config
  MUDCoreUserConfig,
  // schemas
  zObjectName,
  zUserEnum,
  zValueName,
  zNamespace,
  zName,
} from "@latticexyz/config";
import { DEFAULTS, PATH_DEFAULTS, TABLE_DEFAULTS } from "./defaults";
import { UserType } from "@latticexyz/common/codegen";
import { SchemaAbiType, isSchemaAbiType, schemaAbiTypes } from "@latticexyz/schema-type";

const zTableName = zObjectName;
const zKeyName = zValueName;
const zColumnName = zValueName;
const zUserEnumName = zObjectName;
const zUserTypeName = zObjectName;

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

type ResolvedSchema<
  TSchema extends Record<string, string>,
  TUserTypes extends Record<string, Pick<UserType, "internalType">>
> = {
  [key in keyof TSchema]: TSchema[key] extends keyof TUserTypes
    ? TUserTypes[TSchema[key]]["internalType"]
    : TSchema[key];
};

// TODO: add strong types to UserTypes config and use them here
// (see https://github.com/latticexyz/mud/pull/1588)
export function resolveUserTypes<
  TSchema extends Record<string, string>,
  TUserTypes extends Record<string, Pick<UserType, "internalType">>
>(schema: TSchema, userTypes: TUserTypes): ResolvedSchema<TSchema, TUserTypes> {
  const resolvedSchema: Record<string, SchemaAbiType> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (isSchemaAbiType(value)) {
      resolvedSchema[key] = value;
    } else if (userTypes[value] !== undefined) {
      resolvedSchema[key] = userTypes[value].internalType as SchemaAbiType;
    } else {
      const staticArray = parseStaticArray(value);
      if (!staticArray) throw new Error(`Unexpected type: ${value}`);
      resolvedSchema[key] = `${staticArray.elementType as StaticAbiType}[]`;
    }
  }
  return resolvedSchema as ResolvedSchema<TSchema, TUserTypes>;
}

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
  /** Offchain tables don't write to onchain storage, but only emit events for offchain clients. Default is false. */
  offchainOnly?: boolean;
  /**
   * Table's key names mapped to their types.
   * Default is `{ key: "bytes32" }`
   * Key names' first letter should be lowercase.
   */
  keySchema?: Record<string, KeySchema<StaticUserTypes>>;
  /**
   * Table's field names mapped to their types.
   * Field names' first letter should be lowercase.
   */
  valueSchema: SchemaConfig<UserTypes>;
}

export type FullTableConfig<
  UserTypes extends StringForUnion = StringForUnion,
  StaticUserTypes extends StringForUnion = StringForUnion
> = Required<TableConfig<UserTypes, StaticUserTypes>> & {
  valueSchema: FullSchemaConfig<UserTypes>;
};

export interface ExpandTableConfig<T extends TableConfig<string, string>, TableName extends string>
  extends OrDefaults<
    T,
    {
      directory: typeof TABLE_DEFAULTS.directory;
      name: TableName;
      tableIdArgument: typeof TABLE_DEFAULTS.tableIdArgument;
      storeArgument: typeof TABLE_DEFAULTS.storeArgument;
      // dataStruct isn't expanded, because its value is conditional on the number of value schema fields
      dataStruct: boolean;
      keySchema: typeof TABLE_DEFAULTS.keySchema;
      offchainOnly: typeof TABLE_DEFAULTS.offchainOnly;
    }
  > {
  valueSchema: ExpandSchemaConfig<T["valueSchema"]>;
}

const zFullTableConfig = z
  .object({
    directory: z.string().default(TABLE_DEFAULTS.directory),
    name: zName.optional(),
    tableIdArgument: z.boolean().default(TABLE_DEFAULTS.tableIdArgument),
    storeArgument: z.boolean().default(TABLE_DEFAULTS.storeArgument),
    dataStruct: z.boolean().optional(),
    keySchema: zKeySchema,
    valueSchema: zSchemaConfig,
    offchainOnly: z.boolean().default(TABLE_DEFAULTS.offchainOnly),
  })
  .transform((arg) => {
    // default dataStruct value depends on value schema's length
    if (Object.keys(arg.valueSchema).length === 1) {
      arg.dataStruct ??= false;
    } else {
      arg.dataStruct ??= true;
    }
    return arg as RequireKeys<typeof arg, "dataStruct">;
  });

const zShorthandTableConfig = zFieldData.transform((fieldData) => {
  return zFullTableConfig.parse({
    valueSchema: {
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
    table.name = tableName.slice(0, STORE_NAME_MAX_LENGTH);

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
    ? ExpandTableConfig<{ valueSchema: { value: T[TableName] } }, TableName extends string ? TableName : never>
    : T[TableName] extends TableConfig<string, string>
    ? ExpandTableConfig<T[TableName], TableName extends string ? TableName : never>
    : // Weakly typed values get a weakly typed expansion.
      // This shouldn't normally happen within `mudConfig`, but can be manually triggered via `ExpandMUDUserConfig`
      ExpandTableConfig<TableConfig<string, string>, TableName extends string ? TableName : string>;
};

/************************************************************************
 *
 *    ENUMS
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
 *    USER TYPES
 *
 ************************************************************************/

export type UserTypesConfig<UserTypeNames extends StringForUnion = StringForUnion> = never extends UserTypeNames
  ? {
      /**
       * User types mapped to file paths from which to import them.
       * Paths are treated as relative to root.
       * Paths that don't start with a "." have foundry remappings applied to them first.
       *
       * (user types are inferred to be absent)
       */
      userTypes?: Record<UserTypeNames, UserType>;
    }
  : StringForUnion extends UserTypeNames
  ? {
      /**
       * User types mapped to file paths from which to import them.
       * Paths are treated as relative to root.
       * Paths that don't start with a "." have foundry remappings applied to them first.
       *
       * (user types aren't inferred - use `mudConfig` or `storeConfig` helper, and `as const` for variables)
       */
      userTypes?: Record<UserTypeNames, UserType>;
    }
  : {
      /**
       * User types mapped to file paths from which to import them.
       * Paths are treated as relative to root.
       * Paths that don't start with a "." have foundry remappings applied to them first.
       *
       * User types defined here can be used as types in table schemas/keys
       */
      userTypes: Record<UserTypeNames, UserType>;
    };

const zUserTypeConfig = z.object({
  filePath: z.string(),
  internalType: z.enum(schemaAbiTypes),
});

export const zUserTypesConfig = z.object({
  userTypes: z.record(zUserTypeName, zUserTypeConfig).default(DEFAULTS.userTypes),
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
  UserTypeNames extends StringForUnion = StringForUnion,
  StaticUserTypes extends ExtractUserTypes<EnumNames | UserTypeNames> = ExtractUserTypes<EnumNames | UserTypeNames>
> = T &
  EnumsConfig<EnumNames> &
  UserTypesConfig<UserTypeNames> & {
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
    /** Filename where common user types will be generated and imported from. Default is "common.sol" */
    userTypesFilename?: string;
    /** Path to the directory where generated files will be placed. (Default is "codegen") */
    codegenDirectory?: string;
    /** Filename where codegen index will be generated. Default is "index.sol" */
    codegenIndexFilename?: string;
  };

const StoreConfigUnrefined = z
  .object({
    namespace: zNamespace.default(DEFAULTS.namespace),
    storeImportPath: z.string().default(PATH_DEFAULTS.storeImportPath),
    tables: zTablesConfig,
    userTypesFilename: z.string().default(PATH_DEFAULTS.userTypesFilename),
    codegenDirectory: z.string().default(PATH_DEFAULTS.codegenDirectory),
    codegenIndexFilename: z.string().default(PATH_DEFAULTS.codegenIndexFilename),
  })
  .merge(zEnumsConfig)
  .merge(zUserTypesConfig);

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
    const fieldNames = Object.keys(table.valueSchema);
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
  const staticUserTypeNames = [...Object.keys(config.enums), ...Object.keys(config.userTypes)];
  const userTypeNames = staticUserTypeNames;
  const globalNames = [...tableLibraryNames, ...userTypeNames];
  const duplicateGlobalNames = getDuplicates(globalNames);
  if (duplicateGlobalNames.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Table library names, enum names, user type names must be globally unique: ${duplicateGlobalNames.join(
        ", "
      )}`,
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
    for (const fieldType of Object.values(table.valueSchema)) {
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
