import { z, ZodError } from "zod";
import { fromZodErrorCustom, UnrecognizedSystemErrorFactory } from "../utils/errors.js";
import { EthereumAddress, ObjectName, Selector } from "./commonSchemas.js";
import { loadConfig } from "./loadConfig.js";

const SystemName = ObjectName;
const SystemAccessList = z.array(SystemName.or(EthereumAddress)).default([]);

// The system config is a combination of a fileSelector config and access config
const SystemConfig = z.intersection(
  z.object({
    fileSelector: Selector,
  }),
  z.discriminatedUnion("openAccess", [
    z.object({
      openAccess: z.literal(true),
    }),
    z.object({
      openAccess: z.literal(false),
      accessList: SystemAccessList,
    }),
  ])
);

// The parsed world config is the result of parsing the user config
export const WorldConfig = z.object({
  namespace: Selector.default(""),
  worldContractName: z.string().optional(),
  overrideSystems: z.record(SystemName, SystemConfig).default({}),
  excludeSystems: z.array(SystemName).default([]),
  postDeployScript: z.string().default("PostDeploy"),
  deploymentInfoDirectory: z.string().default("."),
  worldgenDirectory: z.string().default("world"),
  worldImportPath: z.string().default("@latticexyz/world/src/"),
});

/**
 * Resolves the system config by combining the default and overridden system configs,
 * @param systemName name of the system
 * @param config optional SystemConfig object, if none is provided the default config is used
 * @param existingContracts optional list of existing contract names, used to validate system names in the access list. If not provided, no validation is performed.
 * @returns ResolvedSystemConfig object
 * Default value for fileSelector is `systemName`
 * Default value for openAccess is true
 * Default value for accessListAddresses is []
 * Default value for accessListSystems is []
 */
export function resolveSystemConfig(systemName: string, config?: SystemUserConfig, existingContracts?: string[]) {
  const fileSelector = config?.fileSelector ?? systemName;
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
        throw UnrecognizedSystemErrorFactory(["overrideSystems", systemName, "accessList"], accessListItem);
      }
      accessListSystems.push(accessListItem);
    }
  }

  return { fileSelector, openAccess, accessListAddresses, accessListSystems };
}

/**
 * Resolves the world config by combining the default and overridden system configs,
 * filtering out excluded systems, validate system names refer to existing contracts, and
 * splitting the access list into addresses and system names.
 */
export function resolveWorldConfig(config: ParsedWorldConfig, existingContracts?: string[]) {
  // Include contract names ending in "System", but not the base "System" contract, and not Interfaces
  const defaultSystemNames =
    existingContracts?.filter((name) => name.endsWith("System") && name !== "System" && !name.match(/^I[A-Z]/)) ?? [];
  const overriddenSystemNames = Object.keys(config.overrideSystems);

  // Validate every key in overrideSystems refers to an existing system contract (and is not called "World")
  if (existingContracts) {
    for (const systemName of overriddenSystemNames) {
      if (!existingContracts.includes(systemName) || systemName === "World") {
        throw UnrecognizedSystemErrorFactory(["overrideSystems", systemName], systemName);
      }
    }
  }

  // Combine the default and overridden system names and filter out excluded systems
  const systemNames = [...new Set([...defaultSystemNames, ...overriddenSystemNames])].filter(
    (name) => !config.excludeSystems.includes(name)
  );

  // Resolve the config
  const resolvedSystems: Record<string, ResolvedSystemConfig> = systemNames.reduce((acc, systemName) => {
    return {
      ...acc,
      [systemName]: resolveSystemConfig(systemName, config.overrideSystems[systemName], existingContracts),
    };
  }, {});

  const { overrideSystems, excludeSystems, ...otherConfig } = config;
  return { ...otherConfig, systems: resolvedSystems };
}

/**
 * Loads and resolves the world config.
 * @param configPath Path to load the config from. Defaults to "mud.config.mts" or "mud.config.ts"
 * @param existingContracts Optional list of existing contract names to validate system names against. If not provided, no validation is performed. Contract names ending in `System` will be added to the config with default values.
 * @returns Promise of ResolvedWorldConfig object
 */
export async function loadWorldConfig(configPath?: string, existingContracts?: string[]) {
  const config = await loadConfig(configPath);

  try {
    const parsedConfig = WorldConfig.parse(config);
    return resolveWorldConfig(parsedConfig, existingContracts);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "WorldConfig Validation Error");
    } else {
      throw error;
    }
  }
}

export async function parseWorldConfig(config: unknown) {
  return WorldConfig.parse(config);
}

// zod doesn't preserve doc comments
export type SystemUserConfig =
  | {
      /** The full resource selector consists of namespace and fileSelector */
      fileSelector?: string;
    } & (
      | {
          /** If openAccess is true, any address can call the system */
          openAccess: true;
        }
      | {
          /** If openAccess is false, only the addresses or systems in `access` can call the system */
          openAccess: false;
          /** An array of addresses or system names that can access the system */
          accessList: string[];
        }
    );

// zod doesn't preserve doc comments
export interface WorldUserConfig {
  /** The namespace to register tables and systems at. Defaults to the root namespace (empty string) */
  namespace?: string;
  /** The name of the World contract to deploy. If no name is provided, a vanilla World is deployed */
  worldContractName?: string;
  /**
   * Contracts named *System will be deployed by default
   * as public systems at `namespace/ContractName`, unless overridden
   *
   * The key is the system name (capitalized).
   * The value is a SystemConfig object.
   */
  overrideSystems?: Record<string, SystemUserConfig>;
  /** Systems to exclude from automatic deployment */
  excludeSystems?: string[];
  /**
   * Script to execute after the deployment is complete (Default "PostDeploy").
   * Script must be placed in the forge scripts directory (see foundry.toml) and have a ".s.sol" extension.
   */
  postDeployScript?: string;
  /** Directory to write the deployment info to (Default ".") */
  deploymentInfoDirectory?: string;
  /** Directory to output system and world interfaces of `worldgen` (Default "world") */
  worldgenDirectory?: string;
  /** Path for world package imports. Default is "@latticexyz/world/src/" */
  worldImportPath?: string;
}

export type ParsedWorldConfig = z.output<typeof WorldConfig>;

export type ResolvedSystemConfig = ReturnType<typeof resolveSystemConfig>;

export type ResolvedWorldConfig = ReturnType<typeof resolveWorldConfig>;
