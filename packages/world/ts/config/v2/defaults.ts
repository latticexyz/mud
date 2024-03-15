export const SYSTEM_DEFAULTS = {
  registerFunctionSelector: true,
  openAccess: true,
  accessList: [] as string[],
} as const;

export const WORLD_DEFAULTS = {
  worldContractName: undefined,
  worldInterfaceName: "IWorld",
  systems: {},
  excludeSystems: [] as string[],
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldsFile: "./worlds.json",
  worldgenDirectory: "world",
  worldImportPath: "@latticexyz/world/src/",
  modules: [],
} as const;
