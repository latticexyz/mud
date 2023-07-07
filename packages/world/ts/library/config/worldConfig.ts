import { z } from "zod";
import { DynamicResolutionType, zEthereumAddress, zObjectName, zSelector } from "@latticexyz/config";
import { NAMESPACED_DEFAULTS, SYSTEM_DEFAULTS, WORLD_DEFAULTS } from "./defaults";

const zSystemName = zObjectName;
const zModuleName = zObjectName;
const zSystemAccessList = z.array(zSystemName.or(zEthereumAddress)).default(SYSTEM_DEFAULTS.accessList);

// The system config is a combination of a name config and access config
const zSystemConfig = z.intersection(
  z.object({
    name: zSelector.optional(),
    registerFunctionSelectors: z.boolean().default(SYSTEM_DEFAULTS.registerFunctionSelector),
  }),
  z.discriminatedUnion("openAccess", [
    z.object({
      openAccess: z.literal(true).default(SYSTEM_DEFAULTS.openAccess),
    }),
    z.object({
      openAccess: z.literal(false),
      accessList: zSystemAccessList,
    }),
  ])
);

const zValueWithType = z.object({
  value: z.union([z.string(), z.number(), z.instanceof(Uint8Array)]),
  type: z.string(),
});
const zDynamicResolution = z.object({ type: z.nativeEnum(DynamicResolutionType), input: z.string() });

const zModuleConfig = z.object({
  name: zModuleName,
  root: z.boolean().default(false),
  args: z.array(z.union([zValueWithType, zDynamicResolution])).default([]),
});

const zWorldGeneralConfig = z.object({
  worldContractName: z.string().optional(),
  worldInterfaceName: z.string().default(WORLD_DEFAULTS.worldInterfaceName),
  postDeployScript: z.string().default(WORLD_DEFAULTS.postDeployScript),
  deploysDirectory: z.string().default(WORLD_DEFAULTS.deploysDirectory),
  worldsFile: z.string().default(WORLD_DEFAULTS.worldsFile),
  worldgenDirectory: z.string().default(WORLD_DEFAULTS.worldgenDirectory),
  worldImportPath: z.string().default(WORLD_DEFAULTS.worldImportPath),
  modules: z.array(zModuleConfig).default(WORLD_DEFAULTS.modules),
});

const zWorldNamespacedConfig = z.object({
  systems: z.record(zSystemName, zSystemConfig).default(NAMESPACED_DEFAULTS.systems),
  excludeSystems: z.array(zSystemName).default(NAMESPACED_DEFAULTS.excludeSystems),
});

// The expanded user config
export const zWorldConfig = zWorldGeneralConfig.merge(
  z.object({
    namespaces: z.record(zSelector, zWorldNamespacedConfig),
  })
);

// Passthrough preserves other plugins' options
export const zPluginWorldConfig = zWorldGeneralConfig
  .merge(
    z.object({
      namespaces: z.record(zSelector, zWorldNamespacedConfig.passthrough()),
    })
  )
  .passthrough();
