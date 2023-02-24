import { findUpSync } from "find-up";
import path from "path";
import { SchemaType } from "@latticexyz/schema-type";

// TODO require may or may not be needed, finish exploring the various configurations
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { ERRORS, MUDError } from "./errors";
import { defaultKeyTuple, defaultStoreImportPath, defaultTablePath } from "./constants";
const require = createRequire(fileURLToPath(import.meta.url));

// Based on hardhat's config (MIT)
// https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core

const TS_CONFIG_FILENAME = "mud.config.mts";

export interface StoreUserConfig {
  /** Path for store package imports. Default is "@latticexyz/store/src/" */
  storeImportPath?: string;
  /** Configuration for each table. The keys are table names, 1st letter should be uppercase. */
  tables: {
    [tableName: string]: {
      /** Output path for the file. Default is "tables/" */
      path?: string;
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
  storeImportPath: string;
  tables: {
    [tableName: string]: {
      path: string;
      keyTuple: string[];
      schema: {
        [columnName: string]: SchemaType;
      };
    };
  };
}

export async function loadConfig({ configPath }: { configPath?: string }) {
  configPath = resolveConfigPath(configPath);

  // TODO is this override really necessary?
  process.env.TS_NODE_COMPILER_OPTIONS = `{ "module": "esnext" }`;

  const config = (await import(configPath)).default;
  console.log("Config loaded:", config);

  const validatedConfig = validateConfig(config);

  return resolveConfig(validatedConfig);
}

function validateConfig(config: StoreUserConfig) {
  if (!config) {
    throw new MUDError(ERRORS.INVALID_CONFIG, ["Config file does not default export an object"]);
  }
  if (typeof config.tables !== "object") {
    throw new MUDError(ERRORS.INVALID_CONFIG, ['Config does not have "tables" property']);
  }

  // Collect all table-related config errors
  const errors = [];

  for (const tableName of Object.keys(config.tables)) {
    // validate table name
    if (!/^\w+$/.test(tableName)) {
      errors.push(`Table name "${tableName}" must contain only alphanumeric & underscore characters`);
    }
    if (!/^[A-Z]/.test(tableName)) {
      errors.push(`Table name "${tableName}" must start with a capital letter`);
    }

    const { keyTuple, schema } = config.tables[tableName];
    if (!schema) {
      throw new MUDError(ERRORS.INVALID_CONFIG, [`Table "${tableName}" in must have "schema" property`]);
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
    if (keyTuple) {
      for (const key of keyTuple) {
        if (!/^\w+$/.test(key)) {
          errors.push(`In table "${tableName}" key "${key}" must contain only alphanumeric & underscore characters`);
        }
        if (!/^[a-z]/.test(key)) {
          errors.push(`In table "${tableName}" key "${key}" must start with a lowercase letter`);
        }
      }
    }
  }

  // Display all collected errors at once
  if (errors.length > 0) {
    throw new MUDError(ERRORS.INVALID_CONFIG, errors);
  }

  return config;
}

function resolveConfig(config: StoreUserConfig) {
  config.storeImportPath ??= defaultStoreImportPath;
  // ensure the path has a trailing slash
  config.storeImportPath = path.join(config.storeImportPath, "/");

  for (const tableName of Object.keys(config.tables)) {
    const table = config.tables[tableName];
    table.path ??= defaultTablePath;
    table.keyTuple ??= defaultKeyTuple;
  }
  return config as StoreConfig;
}

function resolveConfigPath(configPath: string | undefined) {
  if (configPath === undefined) {
    configPath = getUserConfigPath();
  } else {
    if (!path.isAbsolute(configPath)) {
      configPath = path.join(process.cwd(), configPath);
      configPath = path.normalize(configPath);
    }
  }
  return configPath;
}

function getUserConfigPath() {
  const tsConfigPath = findUpSync(TS_CONFIG_FILENAME);
  if (tsConfigPath === undefined) {
    throw new MUDError(ERRORS.NOT_INSIDE_PROJECT);
  }
  return tsConfigPath;
}
