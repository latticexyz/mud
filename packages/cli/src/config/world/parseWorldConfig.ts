import { z } from "zod";
import { zEthereumAddress, zObjectName, zSelector } from "../commonSchemas.js";
import { DynamicResolutionType } from "../dynamicResolution.js";

const zSystemName = zObjectName;
const zModuleName = zObjectName;
const zSystemAccessList = z.array(zSystemName.or(zEthereumAddress)).default([]);

// The system config is a combination of a fileSelector config and access config
const zSystemConfig = z.intersection(
  z.object({
    fileSelector: zSelector,
    registerFunctionSelectors: z.boolean().default(true),
  }),
  z.discriminatedUnion("openAccess", [
    z.object({
      openAccess: z.literal(true),
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
  namespace: zSelector.default(""),
  worldContractName: z.string().optional(),
  overrideSystems: z.record(zSystemName, zSystemConfig).default({}),
  excludeSystems: z.array(zSystemName).default([]),
  postDeployScript: z.string().default("PostDeploy"),
  deploymentInfoDirectory: z.string().default("."),
  worldgenDirectory: z.string().default("world"),
  worldImportPath: z.string().default("@latticexyz/world/src/"),
  modules: z.array(zModuleConfig).default([]),
});

export async function parseWorldConfig(config: unknown) {
  return zWorldConfig.parse(config);
}

export type ParsedWorldConfig = z.output<typeof zWorldConfig>;
