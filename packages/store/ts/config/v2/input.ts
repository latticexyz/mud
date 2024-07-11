import { Hex } from "viem";
import { Codegen, TableCodegen, TableDeploy, UserTypes } from "./output";
import { Scope } from "./scope";
import { show } from "@arktype/util";

export type EnumsInput = {
  readonly [enumName: string]: readonly [string, ...string[]];
};

export type SchemaInput = {
  readonly [fieldName: string]: string;
};

export type ScopedSchemaInput<scope extends Scope> = {
  readonly [fieldName: string]: keyof scope["types"];
};

export type TableCodegenInput = Partial<TableCodegen>;
export type TableDeployInput = Partial<TableDeploy>;

export type TableInput = {
  readonly schema: SchemaInput;
  readonly key: readonly string[];
  readonly tableId?: Hex;
  readonly name: string;
  readonly namespace?: string;
  readonly type?: "table" | "offchainTable";
  readonly codegen?: TableCodegenInput;
  readonly deploy?: TableDeployInput;
};

export type TablesInput = {
  readonly [label: string]: Omit<TableInput, "namespace" | "name">;
};

export type CodegenInput = Partial<Codegen>;

export type StoreInput = {
  /**
   * Directory of Solidity source relative to the MUD config.
   * This is used to resolve other paths in the config, like codegen and user types.
   *
   * Defaults to `src` to match `foundry.toml`'s default. If you change this from the default, you may also need to configure foundry with the same source directory.
   */
  readonly sourceDirectory?: string;
  readonly namespace?: string;
  readonly tables?: TablesInput;
  readonly userTypes?: UserTypes;
  readonly enums?: EnumsInput;
  readonly codegen?: CodegenInput;
};

/******** Variations with shorthands ********/

export type TableShorthandInput = SchemaInput | string;

export type TablesWithShorthandsInput = {
  readonly [label: string]: TableInput | TableShorthandInput;
};

export type StoreWithShorthandsInput = show<Omit<StoreInput, "tables"> & { tables: TablesWithShorthandsInput }>;
