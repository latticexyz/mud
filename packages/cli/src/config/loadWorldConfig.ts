import path from "path";
import { ERRORS, MUDError } from "../utils/errors.js";
import { loadConfig } from "./loadConfig.js";
import { isArray, isRecord, isString } from "./utils.js";
import ethers from "ethers";

// Based on hardhat's config (MIT)
// https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core

export type SystemConfig =
  | {
      route: string; // The system will be deployed at `baseRoute + route`
    } & (
      | {
          openAccess: false; // If true, only the addresses in `access` can access the system
          access: string[]; // An array of addresses or system names that can access the system
        }
      | { openAccess: true }
    );

export type SystemsConfig = {
  [systemName: string]: SystemConfig;
};

export interface WorldUserConfig {
  // If no world path is provided, a vanilla World is deployed
  worldPath?: string;
  // The base route to register tables and systems at. Defaults to the root route
  baseRoute?: string;
  // Contracts named *System files will be deployed by default as public systems using their contract name as route, unless overridden
  overrideSystems?: SystemsConfig;
  // Systems to exclude from automatic deployment
  excludeSystems?: string[];
}

export interface WorldConfig extends WorldUserConfig {
  baseRoute: string;
  systems: SystemsConfig;
}

export async function loadWorldConfig(configPath?: string) {
  const config = await loadConfig(configPath);
  const existingSystems: string[] = []; // TODO

  const validatedConfig = validateConfig(config, existingSystems);

  return resolveConfig(validatedConfig, existingSystems);
}

function validateConfig(config: unknown, existingSystems: string[]) {
  if (!isRecord(config)) {
    throw new MUDError(ERRORS.INVALID_CONFIG, ["Config file does not default export an object"]);
  }

  // Collect all system-related config errors
  const errors: string[] = [];

  // validate base route
  if (isString(config.baseRoute)) errors.push(...validateRoute(config.baseRoute));

  // validate systems config
  if (isRecord(config.overrideSystems)) {
    for (const systemName of Object.keys(config.overrideSystems)) {
      // validate system name
      if (!/^\w+$/.test(systemName)) {
        errors.push(`System name "${systemName}" must contain only alphanumeric & underscore characters`);
      }

      if (!/^[A-Z]/.test(systemName)) {
        errors.push(`System name "${systemName}" must start with a capital letter`);
      }

      if (existingSystems.includes(systemName)) {
        errors.push(`Can not find source for system "${systemName}"`);
      }

      const systemData = config.overrideSystems[systemName];
      if (!isRecord(systemData)) {
        errors.push(`Overridden system "${systemName}" is not a valid object`);
        continue;
      }

      const { route, openAccess, access } = systemData;
      if (!isString(route)) {
        errors.push(`Overridden system "${systemName}" must have a "route" property`);
        continue;
      }

      // validate route (single level)
      errors.push(...validateRoute(route, true));

      // validate access
      if (!openAccess) {
        if (!isArray(access)) {
          errors.push(`Overridden system "${systemName}" must have an "access" array because it is private`);
          continue;
        }
        for (const item of access) {
          if (!isString(item) || !(existingSystems.includes(item) || ethers.utils.isAddress(item))) {
            errors.push(
              `System "${systemName}" access item "${item}" must be an existing system name or Ethereum address`
            );
          }
        }
      }
    }
  }

  // Display all collected errors at once
  if (errors.length > 0) {
    throw new MUDError(ERRORS.INVALID_CONFIG, errors);
  }

  return config as unknown as WorldUserConfig;
}

function validateRoute(route: string, singleLevel?: boolean) {
  const errors: string[] = [];

  if (route[0] !== "/") {
    errors.push(`Route "${route}" must start with "/"`);
  }

  if (route[route.length - 1] === "/") {
    errors.push(`Route "${route}" must not end with "/"`);
  }

  const parts = route.split("/");
  if (singleLevel && parts.length > 2) {
    errors.push(`Route "${route}" must only have one level (e.g. "/foo")`);
  }

  // start at 1 to skip the first empty part
  for (let i = 1; i < parts.length; i++) {
    if (parts[i] === "") {
      errors.push(`Route "${route}" must not contain empty route fragments (e.g. "//")`);
    }

    if (!/^\w+$/.test(parts[i])) {
      errors.push(`Route "${route}" must contain only alphanumeric & underscore characters`);
    }
  }

  return errors;
}

function resolveConfig(config: WorldUserConfig, existingSystems: string[]): WorldConfig {
  const overrideSystemNames = Object.keys(config.overrideSystems ?? {});
  const excludeSystemNames = config.excludeSystems ?? [];

  const systemNames = new Set(
    [...existingSystems, ...overrideSystemNames].filter((name) => !excludeSystemNames.includes(name))
  );

  const systems: SystemsConfig = {};
  for (const systemName of systemNames) {
    systems[systemName] = config.overrideSystems?.[systemName] ?? { openAccess: true, route: systemName };
  }

  return {
    ...config,
    baseRoute: config.baseRoute ?? "",
    systems,
  };
}
