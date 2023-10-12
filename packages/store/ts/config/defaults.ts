export const PATH_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src/",
  userTypesFilename: "common.sol",
  codegenDirectory: "codegen",
  codegenIndexFilename: "index.sol",
} as const;

export const DEFAULTS = {
  namespace: "",
  enums: {} as Record<string, never>,
  userTypes: {} as Record<string, never>,
} as const;

export const TABLE_DEFAULTS = {
  directory: "tables",
  keySchema: { key: "bytes32" },
  tableIdArgument: false,
  storeArgument: false,
  offchainOnly: false,
} as const;
