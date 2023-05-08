import { OrDefaults } from "@latticexyz/common/type-utils";
import { DEFAULTS } from "../defaults";

export type PathsConfig = {
  /** Path for store package imports. Default is "@latticexyz/store/src/" */
  storeImportPath?: string;
  /** Path to the file where common user types will be generated and imported from. Default is "Types" */
  userTypesPath?: string;
  /** Path to the directory where generated files will be placed. (Default is "codegen") */
  codegenDirectory?: string;
};

export type ExpandedPathsConfig<C extends PathsConfig> = OrDefaults<C, typeof DEFAULTS>;
