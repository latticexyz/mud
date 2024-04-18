import { Hex } from "viem";
import { Codegen, Enums, TableCodegen, TableDeploy, UserTypes } from "./output";
import { Scope } from "./scope";
import { evaluate } from "@arktype/util";

export type SchemaInput = {
  readonly [key: string]: string;
};

export type ScopedSchemaInput<scope extends Scope> = {
  readonly [key: string]: keyof scope["types"];
};

export type TableInput = {
  readonly schema: SchemaInput;
  readonly key: readonly string[];
  readonly tableId?: Hex;
  readonly name: string;
  readonly namespace?: string;
  readonly type?: "table" | "offchainTable";
  readonly codegen?: Partial<TableCodegen>;
  readonly deploy?: Partial<TableDeploy>;
};

export type TablesInput = {
  readonly [key: string]: Omit<TableInput, "namespace" | "name">;
};

export type StoreInput = {
  readonly namespace?: string;
  readonly tables?: TablesInput;
  readonly userTypes?: UserTypes;
  readonly enums?: Enums;
  readonly codegen?: Partial<Codegen>;
};

/******** Variations with shorthands ********/

export type TableShorthandInput = SchemaInput | string;

export type TablesWithShorthandsInput = {
  readonly [key: string]: TableInput | TableShorthandInput;
};

export type StoreWithShorthandsInput = evaluate<Omit<StoreInput, "tables"> & { tables: TablesWithShorthandsInput }>;
