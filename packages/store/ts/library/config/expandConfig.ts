import { AbiTypes, StaticAbiTypes } from "@latticexyz/schema-type";
import { RefinementCtx, z, ZodIssueCode } from "zod";
import { RequireKeys } from "@latticexyz/common/type-utils";
import {
  // validation utils
  getDuplicates,
  parseStaticArray,
  // config
  // schemas
  zObjectName,
  zSelector,
  zUserEnum,
  zValueName,
} from "@latticexyz/config";
import { Config, Expanded } from "./types";
import { DEFAULTS, PATH_DEFAULTS, TABLE_DEFAULTS } from "./defaults";

export function expandConfig<C extends Config>(config: C) {
  return zStoreConfig.parse(config) as unknown as Expanded<C>;
}

const zTableName = zObjectName;
const zKeyName = zValueName;
const zColumnName = zValueName;
const zUserEnumName = zObjectName;

// Fields can use AbiType or one of user-defined wrapper types
// (user types are refined later, based on the appropriate config options)
const zFieldData = z.string();

// Primary keys allow only static types
// (user types are refined later, based on the appropriate config options)
const zPrimaryKey = z.string();
const zPrimaryKeys = z.record(zKeyName, zPrimaryKey).default(TABLE_DEFAULTS.primaryKeys);

/************************************************************************
 *
 *    TABLE SCHEMA
 *
 ************************************************************************/

const zFullSchemaConfig = z
  .record(zColumnName, zFieldData)
  .refine((arg) => Object.keys(arg).length > 0, "Table schema may not be empty");

const zShorthandSchemaConfig = zFieldData.transform((fieldData) => {
  return zFullSchemaConfig.parse({
    value: fieldData,
  });
});

const zSchemaConfig = zFullSchemaConfig.or(zShorthandSchemaConfig);

/************************************************************************
 *
 *    TABLE
 *
 ************************************************************************/

const zFullTableConfig = z
  .object({
    directory: z.string().default(TABLE_DEFAULTS.directory),
    name: zSelector.optional(),
    tableIdArgument: z.boolean().default(TABLE_DEFAULTS.tableIdArgument),
    storeArgument: z.boolean().default(TABLE_DEFAULTS.storeArgument),
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

const zTableConfig = zFullTableConfig.or(zShorthandTableConfig);

/************************************************************************
 *
 *    TABLES
 *
 ************************************************************************/

const zTablesConfig = z.record(zTableName, zTableConfig).transform((tables) => {
  // default name depends on tableName
  for (const tableName of Object.keys(tables)) {
    const table = tables[tableName];
    table.name ??= tableName;

    tables[tableName] = table;
  }
  return tables as Record<string, RequireKeys<(typeof tables)[string], "name">>;
});

/************************************************************************
 *
 *    USER TYPES
 *
 ************************************************************************/

const zEnumsConfig = z.object({
  enums: z.record(zUserEnumName, zUserEnum).default(DEFAULTS.enums),
});

/************************************************************************
 *
 *    FINAL
 *
 ************************************************************************/

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
  const staticUserTypeNames = Object.keys(config.enums);
  const userTypeNames = staticUserTypeNames;
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
      validateStaticAbiOrUserType(staticUserTypeNames, primaryKeyType, ctx);
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
