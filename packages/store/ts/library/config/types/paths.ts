import { OrDefault } from "@latticexyz/common/type-utils";
import { PATH_DEFAULTS } from "../defaults";

export type PathsConfig = {
  /** Path for store package imports. Default is "@latticexyz/store/src/" */
  storeImportPath?: string;
  /** Path to the file where common user types will be generated and imported from. Default is "Types" */
  userTypesPath?: string;
  /** Path to the directory where generated files will be placed. (Default is "codegen") */
  codegenDirectory?: string;
};

export type ExpandedPathsConfig<C extends PathsConfig> = {
  storeImportPath: OrDefault<C["storeImportPath"], typeof PATH_DEFAULTS.storeImportPath>;
  userTypesPath: OrDefault<C["userTypesPath"], typeof PATH_DEFAULTS.userTypesPath>;
  codegenDirectory: OrDefault<C["codegenDirectory"], typeof PATH_DEFAULTS.codegenDirectory>;
};
