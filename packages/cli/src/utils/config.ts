import { findUpSync } from "find-up";
import path from "path";
import { SchemaType } from "@latticexyz/schema-type";

// TODO require may or may not be needed, finish exploring the various configurations
import { createRequire } from "module";
import { fileURLToPath } from "url";
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

  // TODO is overriding ts-node compiler options ok? is loadTsNode needed?
  process.env.TS_NODE_COMPILER_OPTIONS = `{ "module": "esnext" }`;
  // ts-node is required to parse the typescript config
  // await loadTsNode();

  const config = (await import(configPath)).default;
  console.log("Config loaded:", config);

  const validatedConfig = validateConfig(config);

  return resolveConfig(validatedConfig);
}

function validateConfig(config: StoreUserConfig) {
  if (!config) {
    throw new Error("mud config does not export an object");
  }
  if (typeof config.tables !== "object") {
    throw new Error(`mud config must have "tables" property`);
  }
  for (const tableName of Object.keys(config.tables)) {
    // validate table name
    requireAlphanumeric(tableName, "Table name");
    if (!/^[A-Z]/.test(tableName)) {
      throw new Error(`Table name "${tableName}" must start with a capital letter`);
    }

    const { keyTuple, schema } = config.tables[tableName];
    if (!schema) {
      throw new Error(`Table "${tableName}" in mud config must have "schema" property`);
    }
    // validate key names
    if (keyTuple) {
      for (const key of keyTuple) {
        requireAlphanumeric(key, "Table key");
        if (!/^[a-z]/.test(key)) {
          throw new Error(`Table key "${key}" must start with a capital letter`);
        }
      }
    }
  }
  return config;
}

function requireAlphanumeric(name: string, testeeDescription: string) {
  if (!/^\w+$/.test(name)) {
    throw new Error(`${testeeDescription} "${name}" must contain only alphanumeric & underscore characters`);
  }
}

function resolveConfig(config: StoreUserConfig) {
  if (!config.storeImportPath) {
    // TODO reduce hardcode, at least move storePath to constants.ts when it's merged
    config.storeImportPath = "@latticexyz/store/src/";
  }
  // ensure the path has a trailing slash
  config.storeImportPath = path.join(config.storeImportPath, "/");

  for (const tableName of Object.keys(config.tables)) {
    const table = config.tables[tableName];
    if (!table.path) {
      table.path = "tables/";
    }
    if (!table.keyTuple) {
      table.keyTuple = ["key"];
    }
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
    throw new Error("Not inside project");
  }
  return tsConfigPath;
}

async function loadTsNode(tsConfigPath?: string) {
  /*try {
    require.resolve("typescript");
  } catch {
    throw new Error("typescript not installed");
  }

  try {
    require.resolve("ts-node");
  } catch {
    throw new Error("ts-node not installed");
  }*/

  // If we are running tests we just want to transpile
  /*if (isRunningHardhatCoreTests()) {
    require("ts-node/register/transpile-only");
    return;
  }*/

  if (tsConfigPath !== undefined) {
    process.env.TS_NODE_PROJECT = tsConfigPath;
  }

  // See: https://github.com/nomiclabs/hardhat/issues/265
  if (process.env.TS_NODE_FILES === undefined) {
    process.env.TS_NODE_FILES = "true";
  }

  //process.env.NODE_OPTIONS = "-r ts-node/register --loader ts-node/esm";

  const tsNodeRequirement = "ts-node/register";

  /*if (!shouldTypecheck) {
    tsNodeRequirement += "/transpile-only";
  }*/

  require(tsNodeRequirement);
}
