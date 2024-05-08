export const SYSTEM_DEFAULTS = {
  registerFunctionSelector: true,
  openAccess: true,
  accessList: [],
} as const;

export type SYSTEM_DEFAULTS = typeof SYSTEM_DEFAULTS;

export const WORLD_DEFAULTS = {
  worldContractName: undefined,
  worldInterfaceName: "IWorld",
  systems: {} as Record<string, never>,
  excludeSystems: [],
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldsFile: "./worlds.json",
  worldgenDirectory: "world",
  worldImportPath: "@latticexyz/world/src/",
  modules: [],
} as const;

export type WORLD_DEFAULTS = typeof WORLD_DEFAULTS;
