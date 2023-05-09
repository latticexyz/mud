import { z } from "zod";
import { DynamicResolutionType, zEthereumAddress, zObjectName, zSelector } from "@latticexyz/config";
import { SYSTEM_DEFAULTS, WORLD_DEFAULTS } from "./defaults";

const zSystemName = zObjectName;
const zModuleName = zObjectName;
const zSystemAccessList = z.array(zSystemName.or(zEthereumAddress)).default(SYSTEM_DEFAULTS.accessList);

// The system config is a combination of a name config and access config
const zSystemConfig = z.intersection(
  z.object({
    name: zSelector,
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

// The parsed world config is the result of parsing the user config
export const zWorldConfig = z.object({
  worldContractName: z.string().optional(),
  worldInterfaceName: z.string().default(WORLD_DEFAULTS.worldInterfaceName),
  overrideSystems: z.record(zSystemName, zSystemConfig).default(WORLD_DEFAULTS.overrideSystems),
  excludeSystems: z.array(zSystemName).default(WORLD_DEFAULTS.excludeSystems),
  postDeployScript: z.string().default(WORLD_DEFAULTS.postDeployScript),
  deploysDirectory: z.string().default(WORLD_DEFAULTS.deploysDirectory),
  worldgenDirectory: z.string().default(WORLD_DEFAULTS.worldgenDirectory),
  worldImportPath: z.string().default(WORLD_DEFAULTS.worldImportPath),
  modules: z.array(zModuleConfig).default(WORLD_DEFAULTS.modules),
});

// Catchall preserves other plugins' options
export const zPluginWorldConfig = zWorldConfig.catchall(z.any());
