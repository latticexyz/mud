import { CodegenInput, DeployInput, ModuleInput, SystemInput, WorldInput } from "./input";
import { CONFIG_DEFAULTS as STORE_CONFIG_DEFAULTS } from "@latticexyz/store/config/v2";

export const SYSTEM_DEFAULTS = {
  registerFunctionSelectors: true,
  openAccess: true,
  accessList: [],
} as const satisfies SystemInput;

export type SYSTEM_DEFAULTS = typeof SYSTEM_DEFAULTS;

export const MODULE_DEFAULTS = {
  root: false,
  args: [],
  artifactPath: undefined,
} as const satisfies Pick<ModuleInput, "root" | "args" | "artifactPath">;

export type MODULE_DEFAULTS = typeof MODULE_DEFAULTS;

export const CODEGEN_DEFAULTS = {
  worldInterfaceName: "IWorld",
  worldgenDirectory: "world",
  worldImportPath: "@latticexyz/world/src/",
} as const satisfies CodegenInput;

export type CODEGEN_DEFAULTS = typeof CODEGEN_DEFAULTS;

export const DEPLOY_DEFAULTS = {
  customWorldContract: undefined,
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldsFile: "./worlds.json",
  upgradeableWorldImplementation: false,
} as const satisfies DeployInput;

export type DEPLOY_DEFAULTS = typeof DEPLOY_DEFAULTS;

export const CONFIG_DEFAULTS = {
  ...STORE_CONFIG_DEFAULTS,
  namespaces: {},
  systems: {},
  tables: {},
  excludeSystems: [],
  modules: [],
  codegen: CODEGEN_DEFAULTS,
  deploy: DEPLOY_DEFAULTS,
} as const satisfies WorldInput;

export type CONFIG_DEFAULTS = typeof CONFIG_DEFAULTS;
