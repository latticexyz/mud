export const PATH_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src/",
  userTypesPath: "Types",
  codegenDirectory: "codegen",
} as const;

export const DEFAULTS = {
  namespace: "",
} as const;

export const TABLE_DEFAULTS = {
  directory: "tables",
  primaryKeys: { key: "bytes32" },
  tableIdArgument: false,
  storeArgument: false,
  dataStruct: true,
} as const;
