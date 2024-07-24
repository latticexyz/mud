import { show } from "@arktype/util";
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
  /** @internal */
  readonly storeImportPath: string;
  readonly userTypesFilename: string;
  /**
   * Directory to output codegenerated files relative to config's `sourceDirectory`.
   *
   * Defaults to `codegen`.
   */
  readonly outputDirectory: string;
  readonly indexFilename: string;
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

export type Store = Omit<Namespace, "label"> & {
  /**
   * Whether this project is using multiple namespaces or not, dictated by using `namespaces` config key.
   *
   * If using multiple namespaces, systems must be organized in `{sourceDirectory}/namespaces/{namespaceLabel}` directories.
   * Table libraries will similarly be generated into these namespace directories.
   */
  // TODO: do we like this approach?
  //       alternatively could allow defining `sourceDirectory` per namespace and default it to the pattern above,
  //       but it makes resolving user types a little more confusing
  readonly multipleNamespaces: boolean;
  readonly namespaces: Namespaces;
  /**
   * Directory of Solidity source relative to the MUD config.
   * This is used to resolve other paths in the config, like codegen and user types.
   *
   * Defaults to `src` to match `foundry.toml`'s default. If you change this from the default, you may also need to configure foundry with the same source directory.
   */
  readonly sourceDirectory: string;
  readonly userTypes: UserTypes;
  readonly enums: EnumsInput;
  readonly enumValues: EnumValues;
  readonly codegen: Codegen;
};
