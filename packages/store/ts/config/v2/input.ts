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
  /**
   * Human-readable table label. Used as config keys, table library names, and filenames.
   * Labels are not length constrained like resource names, but special characters should be avoided to be compatible with the filesystem, Solidity compiler, etc.
   */
  readonly label: string;
  /**
   * Defaults to `table` if not set.
   */
  readonly type?: "table" | "offchainTable";
  /**
   * Table namespace used in table's resource ID. Only root systems and systems of the same namespace can write to this table.
   * Defaults to the nearest namespace in the config or root namespace if not set.
   */
  readonly namespace?: string;
  /**
   * Table name used in table's resource ID.
   * Defaults to the first 16 characters of `label` if not set.
   */
  readonly name?: string;
  readonly schema: SchemaInput;
  readonly key: readonly string[];
  readonly tableId?: Hex;
  readonly codegen?: TableCodegenInput;
  readonly deploy?: TableDeployInput;
};

export type TablesInput = {
  // remove label and namespace as these are set contextually
  readonly [label: string]: Omit<TableInput, "label" | "namespace">;
};

export type CodegenInput = Partial<Codegen>;

export type NamespaceInput = {
  /**
   * Human-readable namespace label. Used as config keys and directory names.
   * Labels are not length constrained like namespaces within resource IDs, but special characters should be avoided to be compatible with the filesystem, Solidity compiler, etc.
   */
  readonly label: string;
  /**
   * Namespace used in resource ID.
   * Defaults to the first 16 characters of `label` if not set.
   */
  readonly namespace?: string;
  readonly tables?: TablesInput;
};

export type StoreInput = Omit<NamespaceInput, "label"> & {
  /**
   * Directory of Solidity source relative to the MUD config.
   * This is used to resolve other paths in the config, like codegen and user types.
   *
   * Defaults to `src` to match `foundry.toml`'s default. If you change this from the default, you may also need to configure foundry with the same source directory.
   */
  readonly sourceDirectory?: string;
  readonly userTypes?: UserTypes;
  readonly enums?: EnumsInput;
  readonly codegen?: CodegenInput;
};

/******** Variations with shorthands ********/

export type TableShorthandInput = SchemaInput | string;

export type TablesWithShorthandsInput = {
  readonly [label: string]: TablesInput[string] | TableShorthandInput;
};

export type StoreWithShorthandsInput = show<
  Omit<StoreInput, "tables"> & { readonly tables?: TablesWithShorthandsInput }
>;
