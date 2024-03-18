import { Hex } from "viem";
import { CodegenOptions, Enums, TableCodegenOptions, UserTypes } from "./output";

export type SchemaInput = {
  readonly [key: string]: string;
};

export type TableInput = {
  readonly schema: SchemaInput;
  readonly key: readonly string[];
  readonly tableId?: Hex;
  readonly name: string;
  readonly namespace?: string;
  readonly type?: "table" | "offchainTable";
  readonly codegen?: Partial<TableCodegenOptions>;
};

export type TablesInput = {
  readonly [key: string]: TableInput;
};

export type StoreInput = {
  readonly namespace?: string;
  readonly tables: TablesInput;
  readonly userTypes?: UserTypes;
  readonly enums?: Enums;
  readonly codegen?: Partial<CodegenOptions>;
};
