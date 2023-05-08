import { ModuleConfig } from "./types";

export const SYSTEM_DEFAULTS = {
  registerFunctionSelector: true,
  openAccess: true,
  accessListAddresses: [],
  accessListSystems: [],
  accessList: [],
} as const;

export const WORLD_DEFAULTS = {
  namespace: "",
  worldInterfaceName: "IWorld",
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldgenDirectory: "world",
  worldImportPath: "@latticexyz/world/src/",
  overrideSystems: {} as Record<string, never>,
  excludeSystems: [] as string[],
  modules: [] as ModuleConfig[],
} as const;
