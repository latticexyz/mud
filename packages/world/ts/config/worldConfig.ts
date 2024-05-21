import { z } from "zod";
import { zEthereumAddress, zName, zObjectName } from "@latticexyz/config/library";
import { SYSTEM_DEFAULTS, WORLD_DEFAULTS } from "./defaults";

const zSystemName = zObjectName;
const zSystemAccessList = z.array(zSystemName.or(zEthereumAddress)).readonly().default(SYSTEM_DEFAULTS.accessList);

// The system config is a combination of a name config and access config
const zSystemConfig = z.intersection(
  z.object({
    name: zName.optional(),
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
  ]),
);

// The parsed world config is the result of parsing the user config
export const zWorldConfig = z.object({
  worldContractName: z.string().optional(),
  worldInterfaceName: z.string().default(WORLD_DEFAULTS.worldInterfaceName),
  systems: z.record(zSystemName, zSystemConfig).default(WORLD_DEFAULTS.systems),
  excludeSystems: z.array(zSystemName).readonly().default(WORLD_DEFAULTS.excludeSystems),
  postDeployScript: z.string().default(WORLD_DEFAULTS.postDeployScript),
  deploysDirectory: z.string().default(WORLD_DEFAULTS.deploysDirectory),
  worldsFile: z.string().default(WORLD_DEFAULTS.worldsFile),
  worldgenDirectory: z.string().default(WORLD_DEFAULTS.worldgenDirectory),
  worldImportPath: z.string().default(WORLD_DEFAULTS.worldImportPath),
});

// Catchall preserves other plugins' options
export const zPluginWorldConfig = zWorldConfig.catchall(z.any());
