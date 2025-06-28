import { CodegenInput, DeployInput, ModuleInput, SystemDeployInput, SystemInput, WorldInput } from "./input";

export const SYSTEM_DEPLOY_DEFAULTS = {
  disabled: false,
  registerWorldFunctions: true,
} as const satisfies Required<SystemDeployInput>;

export type SYSTEM_DEPLOY_DEFAULTS = typeof SYSTEM_DEPLOY_DEFAULTS;

export const SYSTEM_DEFAULTS = {
  namespaceLabel: "",
  openAccess: true,
  accessList: [],
} as const satisfies Omit<Required<SystemInput>, "label" | "namespace" | "name" | "deploy">;

export type SYSTEM_DEFAULTS = typeof SYSTEM_DEFAULTS;

export const MODULE_DEFAULTS = {
  root: false,
  useDelegation: false,
  args: [],
  artifactPath: undefined,
} as const satisfies Pick<ModuleInput, "root" | "useDelegation" | "args" | "artifactPath">;

export type MODULE_DEFAULTS = typeof MODULE_DEFAULTS;

export const CODEGEN_DEFAULTS = {
  worldInterfaceName: "IWorld",
  worldgenDirectory: "world",
  systemLibrariesDirectory: "systems",
  generateSystemLibraries: false,
  worldImportPath: "@latticexyz/world/src",
} as const satisfies CodegenInput;

export type CODEGEN_DEFAULTS = typeof CODEGEN_DEFAULTS;

export const DEPLOY_DEFAULTS = {
  postDeployScript: "PostDeploy",
  deploysDirectory: "./deploys",
  worldsFile: "./worlds.json",
  upgradeableWorldImplementation: false,
} as const satisfies DeployInput;

export type DEPLOY_DEFAULTS = typeof DEPLOY_DEFAULTS;

export const CONFIG_DEFAULTS = {
  systems: {},
  tables: {},
  excludeSystems: [],
  modules: [],
  codegen: CODEGEN_DEFAULTS,
  deploy: DEPLOY_DEFAULTS,
} as const satisfies WorldInput;

export type CONFIG_DEFAULTS = typeof CONFIG_DEFAULTS;
