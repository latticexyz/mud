import { SchemaType } from "@latticexyz/schema-type";
import { RefinementCtx, z, ZodIssueCode } from "zod";
import { ObjectName, Selector, StaticSchemaType, UserEnum, ValueName } from "./commonSchemas.js";
import { getDuplicates } from "./validation.js";

const TableName = ObjectName;
const KeyName = ValueName;
const ColumnName = ValueName;
const UserEnumName = ObjectName;
const PrototypeName = ObjectName;

// Fields can use SchemaType or one of user defined wrapper types
const FieldData = z.union([z.nativeEnum(SchemaType), UserEnumName]);

// Primary keys allow only static types, but allow static user defined types
const PrimaryKey = z.union([StaticSchemaType, UserEnumName]);
const PrimaryKeys = z.record(KeyName, PrimaryKey).default({ key: SchemaType.BYTES32 });

/************************************************************************
 *
 *    TABLE SCHEMA
 *
 ************************************************************************/

export type SchemaConfig = Record<string, z.input<typeof FieldData>> | z.input<typeof FieldData>;

const FullSchemaConfig = z
  .record(ColumnName, FieldData)
  .refine((arg) => Object.keys(arg).length > 0, "Table schema may not be empty");

const ShorthandSchemaConfig = FieldData.transform((fieldData) => {
  return FullSchemaConfig.parse({
    value: fieldData,
  });
});

export const SchemaConfig = FullSchemaConfig.or(ShorthandSchemaConfig);

/************************************************************************
 *
 *    TABLE
 *
 ************************************************************************/

export interface TableConfig {
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
  /** Table's primary key names mapped to their types. Default is `{ key: SchemaType.BYTES32 }` */
  primaryKeys?: Record<string, z.input<typeof PrimaryKey>>;
  /** Table's column names mapped to their types. Table name's 1st letter should be lowercase. */
  schema: SchemaConfig;
}

const FullTableConfig = z
  .object({
    directory: z.string().default("tables"),
    fileSelector: Selector.optional(),
    tableIdArgument: z.boolean().default(false),
    storeArgument: z.boolean().default(false),
    primaryKeys: PrimaryKeys,
    schema: SchemaConfig,
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

const ShorthandTableConfig = FieldData.transform((fieldData) => {
  return FullTableConfig.parse({
    schema: {
      value: fieldData,
    },
  });
});

export const TableConfig = FullTableConfig.or(ShorthandTableConfig);

/************************************************************************
 *
 *    TABLES
 *
 ************************************************************************/

export type TablesConfig = Record<string, TableConfig | z.input<typeof FieldData>>;

export const TablesConfig = z.record(TableName, TableConfig).transform((tables) => {
  // default route depends on tableName
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

export interface UserTypesConfig {
  /** Path to the file where common types will be generated and imported from. Default is "Types" */
  path?: string;
  /** Enum names mapped to lists of their member names */
  enums?: Record<string, string[]>;
}

export const UserTypesConfig = z
  .object({
    path: z.string().default("Types"),
    enums: z.record(UserEnumName, UserEnum).default({}),
  })
  .default({});

/************************************************************************
 *
 *    PROTOTYPES
 *
 ************************************************************************/

export interface PrototypeConfig {
  /** Output directory path for the file. Default is "prototypes" */
  directory?: string;
  /** Table names used in this prototype, mapped to their options */
  tables: Record<
    string,
    {
      /**
       * Default value is either a string for structs, or a record of strings for each key
       *
       * The string is rendered in solidity as-is, unescaped and without adding quotes
       */
      default?: string | Record<z.input<typeof ColumnName>, string>;
    }
  >;
}

export const PrototypeConfig = z.object({
  directory: z.string().default("prototypes"),
  tables: z.record(
    TableName,
    z.object({
      default: z.union([z.string(), z.record(ColumnName, z.string())]).optional(),
    })
  ),
});

/************************************************************************
 *
 *    FINAL
 *
 ************************************************************************/

// zod doesn't preserve doc comments
export interface StoreUserConfig {
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
   *  - `SchemaType | userType` for a single-value table (aka ECS component).
   *  - FullTableConfig object for multi-value tables (or for customizable options).
   */
  tables: TablesConfig;
  /** User-defined types that will be generated and may be used in table schemas instead of `SchemaType` */
  userTypes?: UserTypesConfig;
  /**
   * Configuration for each prototype - a collection of tables that share primary keys.
   *
   * The key is the prototype name (capitalized). The value is PrototypeConfig.
   */
  prototypes?: Record<string, PrototypeConfig>;
}

export type StoreConfig = z.output<typeof StoreConfig>;

const StoreConfigUnrefined = z.object({
  namespace: Selector.default(""),
  storeImportPath: z.string().default("@latticexyz/store/src/"),
  tables: TablesConfig,
  userTypes: UserTypesConfig,
  prototypes: z.record(PrototypeName, PrototypeConfig).default({}),
});

// finally validate global conditions
export const StoreConfig = StoreConfigUnrefined.superRefine(validateStoreConfig);

export async function parseStoreConfig(config: unknown) {
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
  const prototypeNames = Object.keys(config.prototypes);
  const globalNames = [...tableNames, ...userTypeNames, ...prototypeNames];
  const duplicateGlobalNames = getDuplicates(globalNames);
  if (duplicateGlobalNames.length > 0) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `Table, enum, prototype names must be globally unique: ${duplicateGlobalNames.join(", ")}`,
    });
  }
  // User types must exist
  for (const table of Object.values(config.tables)) {
    for (const primaryKeyType of Object.values(table.primaryKeys)) {
      validateIfUserType(userTypeNames, primaryKeyType, ctx);
    }
    for (const fieldType of Object.values(table.schema)) {
      validateIfUserType(userTypeNames, fieldType, ctx);
    }
  }
  // Prototypes must use valid tables which use the same primary key types
  for (const prototypeName of Object.keys(config.prototypes)) {
    const prototype = config.prototypes[prototypeName];
    if (Object.keys(prototype.tables).length === 0) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `Prototype "${prototypeName}" must not be empty`,
      });
    }

    let primaryKeys, firstTableName;
    for (const prototypeTableName of Object.keys(prototype.tables)) {
      if (!tableNames.includes(prototypeTableName)) {
        // check table's existance
        ctx.addIssue({
          code: ZodIssueCode.custom,
          message: `Prototype "${prototypeName}" uses an invalid table "${prototypeTableName}"`,
        });
      } else {
        const prototypeTable = config.tables[prototypeTableName];
        // check primary keys
        const tablePrimaryKeys = prototypeTable.primaryKeys;
        if (primaryKeys === undefined) {
          primaryKeys = tablePrimaryKeys;
          firstTableName = prototypeTableName;
        } else if (!arraysShallowEqual(Object.values(primaryKeys), Object.values(tablePrimaryKeys))) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message:
              `Prototype "${prototypeName}": different types of primary keys` +
              ` for tables "${prototypeTableName}" and "${firstTableName}"`,
          });
        }
        // prototypes don't support tableIdArgument
        if (prototypeTable.tableIdArgument) {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message:
              `Prototype "${prototypeName}" table "${prototypeTableName}": ` +
              `prototypes require tableIdArgument of all their tables to be false`,
          });
        }
        // also ensure that field defaults are valid
        // (for single-col tables both object and string formats are valid)
        const tableDefault = prototype.tables[prototypeTableName].default;
        const isSingleColumn = Object.keys(prototypeTable.schema).length === 1;
        if (typeof tableDefault === "string") {
          if (!prototypeTable.dataStruct && !isSingleColumn) {
            ctx.addIssue({
              code: ZodIssueCode.custom,
              message:
                `Prototype "${prototypeName}": default for table "${prototypeTableName}"` +
                ` must be an object with individual field defaults, because it has dataStruct == false`,
            });
          }
        } else if (typeof tableDefault === "object") {
          if (prototypeTable.dataStruct && !isSingleColumn) {
            ctx.addIssue({
              code: ZodIssueCode.custom,
              message:
                `Prototype "${prototypeName}": default for table "${prototypeTableName}"` +
                ` must be a string with a single default value, because it has dataStruct == true`,
            });
          }
        } else if (typeof tableDefault !== "undefined") {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message:
              `Prototype "${prototypeName}": default for table "${prototypeTableName}"` +
              ` has invalid type "${typeof tableDefault}"`,
          });
        }
      }
    }
  }
}

function validateIfUserType(
  userTypeNames: string[],
  type: z.output<typeof FieldData> | z.output<typeof PrimaryKey>,
  ctx: RefinementCtx
) {
  if (typeof type === "string" && !userTypeNames.includes(type)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: `User type ${type} is not defined in userTypes`,
    });
  }
}

function arraysShallowEqual<T>(array1: T[], array2: T[]) {
  return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
}

type RequireKeys<T extends Record<string, unknown>, P extends string> = T & Required<Pick<T, P>>;
