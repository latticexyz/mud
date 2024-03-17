import { Hex } from "viem";
import { TableCodegenOptions } from "./output";

export type SchemaInput = {
  [key: string]: string;
};

export type TableInput = {
  schema: SchemaInput;
  key: string[];
  tableId?: Hex;
  name: string;
  namespace?: string;
  type?: "table" | "offchainTable";
  codegen?: Partial<TableCodegenOptions>;
};
