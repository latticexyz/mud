export const PATH_DEFAULTS = {
  storeImportPath: "@latticexyz/store/src/",
  userTypesPath: "Types",
  codegenDirectory: "codegen",
} as const;

export const DEFAULTS = {
  namespace: "",
  enums: {} as Record<string, never>,
} as const;

export const TABLE_DEFAULTS = {
  directory: "tables",
  primaryKeys: { key: "bytes32" },
  tableIdArgument: false,
  storeArgument: true,
  ephemeral: false,
} as const;
