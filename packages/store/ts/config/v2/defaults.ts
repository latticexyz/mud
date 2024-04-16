export const CODEGEN_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src/",
  userTypesFilename: "common.sol",
  outputDirectory: "codegen",
  indexFilename: "index.sol",
} as const;

export type CODEGEN_DEFAULTS = typeof CODEGEN_DEFAULTS;

export const TABLE_CODEGEN_DEFAULTS = {
  outputDirectory: "tables",
  tableIdArgument: false,
  storeArgument: false,
} as const;

export type TABLE_CODEGEN_DEFAULTS = typeof TABLE_CODEGEN_DEFAULTS;

export const TABLE_DEPLOY_DEFAULTS = {
  disabled: false,
} as const;

export type TABLE_DEPLOY_DEFAULTS = typeof TABLE_DEPLOY_DEFAULTS;

export const TABLE_DEFAULTS = {
  namespace: "",
  type: "table",
} as const;

export type TABLE_DEFAULTS = typeof TABLE_DEFAULTS;

export const CONFIG_DEFAULTS = {
  namespace: "",
} as const;

export type CONFIG_DEFAULTS = typeof CONFIG_DEFAULTS;
