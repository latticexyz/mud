import { evaluate } from "@arktype/util";
import { AbiType, Schema, Table as BaseTable } from "@latticexyz/config";
import { EnumsInput } from "./input";

export type { AbiType, Schema };

export type UserTypes = {
  readonly [userTypeName: string]: {
    readonly type: AbiType;
    readonly filePath: string;
  };
};

export type MappedEnums = {
  readonly [enumName: string]: {
    readonly [enumElement: string]: number;
  };
};

export type TableCodegen = {
  readonly outputDirectory: string;
  readonly tableIdArgument: boolean;
  readonly storeArgument: boolean;
  readonly dataStruct: boolean;
};

export type TableDeploy = {
  readonly disabled: boolean;
};

export type Table = evaluate<
  BaseTable & {
    readonly codegen: TableCodegen;
    readonly deploy: TableDeploy;
  }
>;

export type Codegen = {
  readonly storeImportPath: string;
  readonly userTypesFilename: string;
  readonly outputDirectory: string;
  readonly indexFilename: string;
};

export type Store = {
  readonly tables: {
    readonly [namespacedTableName: string]: Table;
  };
  readonly userTypes: UserTypes;
  readonly enums: EnumsInput;
  readonly mappedEnums: MappedEnums;
  readonly namespace: string;
  readonly codegen: Codegen;
};
