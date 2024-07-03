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

export type EnumValues = {
  readonly [enumName: string]: {
    readonly [enumElement: string]: number;
  };
};

export type TableCodegen = {
  /**
   * Directory to output codegenerated files relative to config's `codegen.outputDirectory`.
   *
   * Defaults to `tables`.
   */
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
  /** @internal */
  readonly storeImportPath: string;
  readonly userTypesFilename: string;
  /**
   * Directory to output codegenerated files relative to config's `sourceDirectory`.
   *
   * Defaults to `codegen`.
   */
  readonly outputDirectory: string;
  /**
   * Whether or not to organize codegen output (table libraries, etc.) into directories by namespace.
   *
   * For example, a `Counter` table in the `app` namespace will have codegen at `codegen/app/tables/Counter.sol`.
   *
   * Defaults to `true` when using top-level `namespaces` key, `false` otherwise.
   */
  // TODO: move `namespaces` key handling into store so we can conditionally turn this on/off
  readonly namespaceDirectories: boolean;
  readonly indexFilename: string;
};

export type Store = {
  /**
   * Directory of Solidity source relative to the MUD config.
   * This is used to resolve other paths in the config, like codegen and user types.
   *
   * Defaults to `src` to match `foundry.toml`'s default. If you change this from the default, you may also need to configure foundry with the same source directory.
   */
  readonly sourceDirectory: string;
  /**
   * Directory of MUD metadata generated during build (e.g. systems manifest) and deploy steps (e.g. system and module addresses). This directory is relative to the MUD config.
   *
   * Defaults to `.mud`.
   */
  readonly metadataDirectory: string;
  readonly tables: {
    readonly [namespacedTableName: string]: Table;
  };
  readonly userTypes: UserTypes;
  readonly enums: EnumsInput;
  readonly enumValues: EnumValues;
  readonly namespace: string;
  readonly codegen: Codegen;
};
