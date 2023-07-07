import { getDuplicates, STORE_SELECTOR_MAX_LENGTH, UnrecognizedSystemErrorFactory } from "@latticexyz/config";
import { MUDError } from "@latticexyz/common/errors";
import { flattenTables, StoreConfig } from "@latticexyz/store";
import { SystemConfig, WorldConfig } from "./types";

export type ResolvedSystemConfig = ReturnType<typeof resolveSystemConfig>;

export type ResolvedWorldConfig = ReturnType<typeof resolveWorldConfig>;

/**
 * Resolves the world config by combining the default and overridden system configs,
 * filtering out excluded systems, validate system names refer to existing contracts, and
 * splitting the access list into addresses and system names.
 */
export function resolveWorldConfig(config: StoreConfig & WorldConfig, existingContracts?: string[]) {
  // Include contract names ending in "System", but not the base "System" contract, and not Interfaces
  const defaultSystemNames =
    existingContracts?.filter((name) => name.endsWith("System") && name !== "System" && !name.match(/^I[A-Z]/)) ?? [];
  const defaultSystems = defaultSystemNames.map((name) => ({ namespace: "", name }));
  const overriddenSystems = flattenOverriddenSystems(config.namespaces);
  const excludeSystems = flattenExcludedSystems(config.namespaces);

  // Validate every key in systems refers to an existing system contract (and is not called "World")
  if (existingContracts) {
    for (const { name } of overriddenSystems) {
      if (!existingContracts.includes(name) || name === "World") {
        throw UnrecognizedSystemErrorFactory(["systems", name], name);
      }
    }
  }

  // Resolve the config
  const resolvedSystems: Record<string, ResolvedSystemConfig> = {};
  for (const system of [...defaultSystems, ...overriddenSystems]) {
    const { namespace, name } = system;
    // Filter out excluded systems
    if (
      excludeSystems.some(
        (excludeSystem) => system.namespace === excludeSystem.namespace && system.name === excludeSystem.name
      )
    )
      continue;
    // Systems must have unique names even across different namespaces
    // TODO this can be allowed if we e.g. enforce namespace prefix for contracts
    if (resolvedSystems[name]) {
      throw new MUDError(`Duplicate system name: ${name}`);
    }

    resolvedSystems[name] = resolveSystemConfig(
      namespace,
      name,
      config.namespaces[namespace].systems[name],
      existingContracts
    );
  }

  // Table and system selectors (namespace:name) must be unique
  const tableSelectors = flattenTables(config.namespaces).map(({ namespace, name }) => `${namespace}:${name}`);
  const configuredSystemSelectors = Object.values(resolvedSystems).map(({ namespace, name }) => `${namespace}:${name}`);
  const duplicateSelectors = getDuplicates([...tableSelectors, ...configuredSystemSelectors]);
  if (duplicateSelectors.length > 0) {
    throw new MUDError(`Table and system selectors must be unique: "${duplicateSelectors.join(", ")}"`);
  }

  return { systems: resolvedSystems };
}

/**
 * Resolves the system config by combining the default and overridden system configs,
 * @param namespace namespace of the system
 * @param systemName name of the system
 * @param config optional SystemConfig object, if none is provided the default config is used
 * @param existingContracts optional list of existing contract names, used to validate system names in the access list. If not provided, no validation is performed.
 * @returns ResolvedSystemConfig object
 * Default value for name is `systemName`, sliced to fit max selector length
 * Default value for registerFunctionSelectors is true
 * Default value for openAccess is true
 * Default value for accessListAddresses is []
 * Default value for accessListSystems is []
 */
export function resolveSystemConfig(
  namespace: string,
  systemName: string,
  config?: SystemConfig,
  existingContracts?: string[]
) {
  const name = config?.name ?? systemName.slice(0, STORE_SELECTOR_MAX_LENGTH);
  const registerFunctionSelectors = config?.registerFunctionSelectors ?? true;
  const openAccess = config?.openAccess ?? true;
  const accessListAddresses: string[] = [];
  const accessListSystems: string[] = [];
  const accessList = config && !config.openAccess ? config.accessList : [];

  // Split the access list into addresses and system names
  for (const accessListItem of accessList) {
    if (accessListItem.startsWith("0x")) {
      accessListAddresses.push(accessListItem);
    } else {
      // Validate every system refers to an existing system contract
      if (existingContracts && !existingContracts.includes(accessListItem)) {
        throw UnrecognizedSystemErrorFactory(["systems", systemName, "accessList"], accessListItem);
      }
      accessListSystems.push(accessListItem);
    }
  }

  return { namespace, name, registerFunctionSelectors, openAccess, accessListAddresses, accessListSystems };
}

function flattenOverriddenSystems(namespaces: WorldConfig["namespaces"]) {
  const overriddenSystems = [];
  for (const namespace of Object.keys(namespaces)) {
    for (const name of Object.keys(namespaces[namespace].systems)) {
      overriddenSystems.push({ namespace, name });
    }
  }
  return overriddenSystems;
}

function flattenExcludedSystems(namespaces: WorldConfig["namespaces"]) {
  const excludedSystems = [];
  for (const namespace of Object.keys(namespaces)) {
    for (const name of namespaces[namespace].excludeSystems) {
      excludedSystems.push({ namespace, name });
    }
  }
  return excludedSystems;
}
