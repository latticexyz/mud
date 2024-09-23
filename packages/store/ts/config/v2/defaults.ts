import { CodegenInput, StoreInput, TableCodegenInput, TableDeployInput, TableInput } from "./input";

export const CODEGEN_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src",
  userTypesFilename: "common.sol",
  outputDirectory: "codegen",
  indexFilename: "index.sol",
} as const satisfies CodegenInput;

export type CODEGEN_DEFAULTS = typeof CODEGEN_DEFAULTS;

export const TABLE_CODEGEN_DEFAULTS = {
  outputDirectory: "tables" as string,
  tableIdArgument: false,
  storeArgument: false,
} as const satisfies TableCodegenInput;

export type TABLE_CODEGEN_DEFAULTS = typeof TABLE_CODEGEN_DEFAULTS;

export const TABLE_DEPLOY_DEFAULTS = {
  disabled: false,
} as const satisfies TableDeployInput;

export type TABLE_DEPLOY_DEFAULTS = typeof TABLE_DEPLOY_DEFAULTS;

export const TABLE_DEFAULTS = {
  namespaceLabel: "",
  type: "table",
} as const satisfies Pick<TableInput, "namespaceLabel" | "type">;

export type TABLE_DEFAULTS = typeof TABLE_DEFAULTS;

export const CONFIG_DEFAULTS = {
  sourceDirectory: "src",
  namespace: "",
} as const satisfies StoreInput;

export type CONFIG_DEFAULTS = typeof CONFIG_DEFAULTS;
