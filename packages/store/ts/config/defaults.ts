export const PATH_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src/",
  userTypesFilename: "types.sol",
  codegenIndexFilename: "index.sol",
  codegenDirectory: "codegen",
} as const;

export const DEFAULTS = {
  namespace: "",
  enums: {} as Record<string, never>,
} as const;

export const TABLE_DEFAULTS = {
  directory: "tables",
  keySchema: { key: "bytes32" },
  tableIdArgument: false,
  storeArgument: true,
  ephemeral: false,
} as const;
