import { AbiType, StaticAbiType, Schema, Table as BaseTable } from "@latticexyz/config";

export type { AbiType, Schema };

export type UserTypes = {
  readonly [userTypeName: string]: { type: AbiType; filePath: string };
};

export type Enums = {
  readonly [enumName: string]: readonly [string, ...string[]];
};

export type KeySchema = {
  readonly [keyName: string]: {
    /** the Solidity primitive ABI type */
    readonly type: StaticAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type TableCodegenOptions = {
  readonly directory: string;
  readonly tableIdArgument: boolean;
  readonly storeArgument: boolean;
  readonly dataStruct: boolean;
};

export type Table = BaseTable & {
  readonly keySchema: KeySchema;
  readonly valueSchema: Schema;
  readonly codegen: TableCodegenOptions;
};

export type CodegenOptions = {
  readonly storeImportPath: string;
  readonly userTypesFilename: string;
  readonly codegenDirectory: string;
  readonly codegenIndexFilename: string;
};

export type Config = {
  readonly tables: {
    readonly [namespacedTableName: string]: Table;
  };
  readonly userTypes: UserTypes;
  readonly enums: Enums;
  readonly namespace: string;
  readonly codegen: CodegenOptions;
};
