import path from "path";
import { SchemaType } from "@latticexyz/schema-type";
import {
  defaultBaseRoute,
  defaultKeyTuple,
  defaultSchemaMode,
  defaultStoreImportPath,
  defaultTableRoute,
} from "../utils/constants.js";
import { ERRORS, MUDError } from "../utils/errors.js";
import { loadConfig } from "./loadConfig.js";
import { isArray, isBoolean, isRecord, isString } from "./utils.js";
import { validateRoute } from "../utils/routes.js";

// Based on hardhat's config (MIT)
// https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core

export interface StoreUserConfig {
  /** The base route prefix for table ids. Default is "/" (empty string) */
  baseRoute?: string;
  /** Path for store package imports. Default is "@latticexyz/store/src/" */
  storeImportPath?: string;
  /** Configuration for each table. The keys are table names, 1st letter should be uppercase. */
  tables: {
    [tableName: string]: {
      /** Output path for the file, also used to make table id. Default is "tables/" */
      route?: string;
      /** Make methods accept `_tableId` argument instead of it being hardcoded. Default is false */
      schemaMode?: boolean;
      /** List of names for the table's keys. Default is ["key"] */
      keyTuple?: string[];
      /** Table's columns. The keys are column names, 1st letter should be lowercase. */
      schema: {
        [columnName: string]: SchemaType;
      };
    };
  };
}

export interface StoreConfig extends StoreUserConfig {
  baseRoute: string;
  storeImportPath: string;
  tables: {
    [tableName: string]: {
      route: string;
      schemaMode: boolean;
      keyTuple: string[];
      schema: {
        [columnName: string]: SchemaType;
      };
    };
  };
}

export async function loadStoreConfig(configPath?: string) {
  const config = await loadConfig(configPath);

  const validatedConfig = validateConfig(config);

  return resolveConfig(validatedConfig);
}

function validateConfig(config: unknown) {
  if (!isRecord(config)) {
    throw new MUDError(ERRORS.INVALID_CONFIG, ["Config file does not default export an object"]);
  }
  if (!isRecord(config.tables)) {
    throw new MUDError(ERRORS.INVALID_CONFIG, [`Config does not have a "tables" property object`]);
  }

  // Collect all non-critical errors
  let errors: string[] = [];

  // validate base route
  if (config.baseRoute !== undefined) {
    if (!isString(config.baseRoute)) {
      errors.push(`Optional config property "baseRoute" must be a string, if present`);
    } else if (config.baseRoute !== "") {
      errors = errors.concat(validateRoute(config.baseRoute));
    }
  }

  // validate other optional parameters
  if (config.storeImportPath !== undefined && !isString(config.storeImportPath)) {
    errors.push(`Optional config property "storeImportPath" must be a string, if present`);
  }

  // validate tables
  for (const tableName of Object.keys(config.tables)) {
    // validate table name
    if (!/^\w+$/.test(tableName)) {
      errors.push(`Table name "${tableName}" must contain only alphanumeric & underscore characters`);
    }
    if (!/^[A-Z]/.test(tableName)) {
      errors.push(`Table name "${tableName}" must start with a capital letter`);
    }

    const tableData = config.tables[tableName];
    if (!isRecord(tableData)) {
      errors.push(`Table "${tableName}" is not a valid object`);
      continue;
    }

    const { keyTuple, schema } = tableData;
    if (!isRecord(schema)) {
      errors.push(`Table "${tableName}" must have a "schema" property object`);
      continue;
    }

    // validate schema
    for (const [columnName] of Object.entries(schema)) {
      if (!/^\w+$/.test(columnName)) {
        errors.push(
          `In table "${tableName}" schema column "${columnName}" must contain only alphanumeric & underscore characters`
        );
      }
      if (!/^[a-z]/.test(columnName)) {
        errors.push(`In table "${tableName}" schema column "${columnName}" must start with a lowercase letter`);
      }
    }
    // validate key names
    errors = errors.concat(validateKeyTuple(tableName, keyTuple));

    // validate other table properties
    if (tableData.route !== undefined) {
      if (!isString(tableData.route)) {
        errors.push(`Optional config property "route" must be a string, if present`);
      } else {
        errors = errors.concat(validateRoute(tableData.route));
      }
    }
    if (tableData.schemaMode !== undefined && !isBoolean(tableData.schemaMode)) {
      errors.push(`Optional config property "schemaMode" must be a boolean, if present`);
    }
  }

  // Display all collected errors at once
  if (errors.length > 0) {
    throw new MUDError(ERRORS.INVALID_CONFIG, errors);
  }

  return config as unknown as StoreUserConfig;
}

function validateKeyTuple(tableName: string, keyTuple: unknown) {
  const errors: string[] = [];
  // keyTuple is optional, absence is valid
  if (keyTuple === undefined) return errors;
  // if present, it must be an array of strings
  if (!isArray(keyTuple)) {
    errors.push(`In table "${tableName}" property "keyTuple" must be an array of strings`);
    return errors;
  }
  for (const key of keyTuple) {
    // check that keys are strings
    if (!isString(key)) {
      errors.push(`In table "${tableName}" property "keyTuple" must be an array of strings`);
      continue;
    }
    // and that they are correctly formatted
    if (!/^\w+$/.test(key)) {
      errors.push(`In table "${tableName}" key "${key}" must contain only alphanumeric & underscore characters`);
    }
    if (!/^[a-z]/.test(key)) {
      errors.push(`In table "${tableName}" key "${key}" must start with a lowercase letter`);
    }
  }
  return errors;
}

function resolveConfig(config: StoreUserConfig) {
  config.baseRoute ??= defaultBaseRoute;
  config.storeImportPath ??= defaultStoreImportPath;
  // ensure the path has a trailing slash
  config.storeImportPath = path.join(config.storeImportPath, "/");

  for (const tableName of Object.keys(config.tables)) {
    const table = config.tables[tableName];
    table.route ??= defaultTableRoute;
    table.schemaMode ??= defaultSchemaMode;
    table.keyTuple ??= defaultKeyTuple;
  }
  return config as StoreConfig;
}
