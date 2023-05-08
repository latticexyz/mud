export const DEFAULTS = {
  namespace: "",
  storeImportPath: "@latticexyz/store/src/",
  userTypesPath: "Types",
  codegenDirectory: "codegen",
  enums: {},
} as const;

export const TABLE_DEFAULTS = {
  directory: "tables",
  primaryKeys: { key: "bytes32" },
  tableIdArgument: false,
  storeArgument: false,
  dataStruct: true,
} as const;
