import { show } from "@ark/util";
import { AbiType, Schema, Table as BaseTable } from "@latticexyz/config";
import { EnumsInput } from "./input";

export type { AbiType, Schema };

export type UserTypes = {
  readonly [userTypeName: string]: {
    readonly type: AbiType;
    readonly filePath: string;
  };
};

export type Enums = EnumsInput;

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

export type Table = show<
  BaseTable & {
    readonly codegen: TableCodegen;
    readonly deploy: TableDeploy;
  }
>;

export type Tables = {
  readonly [label: string]: Table;
};

export type Codegen = {
  /**
   * @internal
   * Absolute import path for a package import or starting with `.` for an import relative to project root dir.
   *
   * Defaults to `@latticexyz/store/src` if not set.
   */
  readonly storeImportPath: string;
  readonly userTypesFilename: string;
  /**
   * Directory to output codegenerated files relative to config's `sourceDirectory`.
   *
   * Defaults to `codegen`.
   */
  readonly outputDirectory: string;
  /**
   * Tables index filename.
   *
   * Defaults to `"index.sol"` when in single-namespace mode, and `false` for multi-namespace mode.
   *
   * @deprecated We recommend importing directly from table libraries rather than from the index for better compile times and deterministic deploys.
   */
  readonly indexFilename: string | false;
};

export type Namespace = {
  /**
   * Human-readable namespace label. Used as config keys and directory names.
   * Labels are not length constrained like namespaces within resource IDs, but special characters should be avoided to be compatible with the filesystem, Solidity compiler, etc.
   */
  readonly label: string;
  /**
   * Namespace used in resource ID.
   */
  readonly namespace: string;
  readonly tables: Tables;
};

export type Namespaces = {
  readonly [label: string]: Namespace;
};

export type Store = {
  /**
   * @internal
   * Whether this project is using multiple namespaces or not, dictated by using `namespaces` config key.
   *
   * If using multiple namespaces, systems must be organized in `namespaces/{namespaceLabel}` directories.
   * Similarly, table libraries will be generated into these namespace directories.
   */
  readonly multipleNamespaces: boolean;
  /**
   * When in single-namespace mode, this is set to the config's base `namespace`.
   * When in multi-namespace mode, this is `null`.
   */
  readonly namespace: string | null;
  readonly namespaces: Namespaces;
  /**
   * Flattened set of tables, where each key is `{namespaceLabel}__{tableLabel}`.
   * For namespace labels using an empty string, no double-underscore is used, so the key is `{tableLabel}`.
   * This is kept for backwards compatibility.
   * It's recommended that you use `config.namespaces[namespaceLabel].tables[tableLabel]` instead.
   */
  readonly tables: Namespace["tables"];
  /**
   * Directory of Solidity source relative to the MUD config.
   * This is used to resolve other paths in the config, like codegen and user types.
   *
   * Defaults to `src` to match `foundry.toml`'s default. If you change this from the default, you may also need to configure foundry with the same source directory.
   */
  readonly sourceDirectory: string;
  readonly userTypes: UserTypes;
  readonly enums: Enums;
  readonly enumValues: EnumValues;
  readonly codegen: Codegen;
};
