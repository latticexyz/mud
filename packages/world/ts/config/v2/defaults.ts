export const SYSTEM_DEFAULTS = {
  registerFunctionSelectors: true,
  openAccess: true,
  accessList: [] as string[],
} as const;

export type SYSTEM_DEFAULTS = typeof SYSTEM_DEFAULTS;

export const CODEGEN_DEFAULTS = {
  worldInterfaceName: "IWorld",
  worldgenDirectory: "world",
  worldImportPath: "@latticexyz/world/src/",
} as const;

export type CODEGEN_DEFAULTS = typeof CODEGEN_DEFAULTS;

export const DEPLOY_DEFAULTS = {
  customWorldContract: undefined,
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldsFile: "./worlds.json",
  upgradeableWorldImplementation: false,
} as const;

export type DEPLOY_DEFAULTS = typeof DEPLOY_DEFAULTS;

export const CONFIG_DEFAULTS = {
  systems: {},
  tables: {},
  excludeSystems: [] as string[],
  modules: [],
  codegen: CODEGEN_DEFAULTS,
  deploy: DEPLOY_DEFAULTS,
} as const;

export type CONFIG_DEFAULTS = typeof CONFIG_DEFAULTS;
