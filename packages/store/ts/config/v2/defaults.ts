export const CODEGEN_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src/",
  userTypesFilename: "common.sol",
  codegenDirectory: "codegen",
  codegenIndexFilename: "index.sol",
} as const;

export const TABLE_CODEGEN_DEFAULTS = {
  directory: "tables",
  tableIdArgument: false,
  storeArgument: false,
} as const;

export const TABLE_DEFAULTS = {
  namespace: "",
  type: "table",
} as const;

export const CONFIG_DEFAULTS = {
  namespace: "",
} as const;
