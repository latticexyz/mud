export const SYSTEM_DEFAULTS = {
  registerFunctionSelectors: true,
  openAccess: true,
  accessList: [] as string[],
} as const;

export const CODEGEN_DEFAULTS = {
  worldInterfaceName: "IWorld",
  worldgenDirectory: "world",
  worldImportPath: "@latticexyz/world/src/",
} as const;

export const DEPLOYMENT_DEFAULTS = {
  customWorldContract: undefined,
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldsFile: "./worlds.json",
} as const;

export const CONFIG_DEFAULTS = {
  systems: {},
  excludeSystems: [] as string[],
  modules: [],
} as const;
