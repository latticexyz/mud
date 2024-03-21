export const CODEGEN_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src/",
  userTypesFilename: "common.sol",
  outputDirectory: "codegen",
  indexFilename: "index.sol",
} as const;

export const TABLE_CODEGEN_DEFAULTS = {
  outputDirectory: "tables",
  tableIdArgument: false,
  storeArgument: false,
} as const;

export const TABLE_DEPLOY_DEFAULTS = {
  disabled: false,
} as const;

export const TABLE_DEFAULTS = {
  namespace: "",
  type: "table",
} as const;

export const CONFIG_DEFAULTS = {
  namespace: "",
} as const;
