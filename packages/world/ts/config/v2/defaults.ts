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

export const DEPLOY_DEFAULTS = {
  customWorldContract: undefined,
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldsFile: "./worlds.json",
  useProxy: false,
} as const;

export const CONFIG_DEFAULTS = {
  systems: {},
  tables: {},
  excludeSystems: [] as string[],
  modules: [],
  codegen: CODEGEN_DEFAULTS,
  deploy: DEPLOY_DEFAULTS,
} as const;
