import { AbiType, Schema, Table as BaseTable } from "@latticexyz/config";

export type { AbiType, Schema };

export type UserTypes = {
  readonly [userTypeName: string]: { type: AbiType; filePath: string };
};

export type Enums = {
  readonly [enumName: string]: readonly [string, ...string[]];
};

export type TableCodegen = {
  readonly directory: string;
  readonly tableIdArgument: boolean;
  readonly storeArgument: boolean;
  readonly dataStruct: boolean;
};

export type TableDeploy = {
  readonly disable: boolean;
};

export type Table = BaseTable & {
  readonly codegen: TableCodegen;
  readonly deploy: TableDeploy;
};

export type Codegen = {
  readonly storeImportPath: string;
  readonly userTypesFilename: string;
  readonly codegenDirectory: string;
  readonly codegenIndexFilename: string;
};

export type Store = {
  readonly tables: {
    readonly [namespacedTableName: string]: Table;
  };
  readonly userTypes: UserTypes;
  readonly enums: Enums;
  readonly namespace: string;
  readonly codegen: Codegen;
};
