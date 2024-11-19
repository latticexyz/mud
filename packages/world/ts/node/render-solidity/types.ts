import type { ImportDatum, ContractInterfaceFunction, ContractInterfaceError } from "@latticexyz/common/codegen";

export interface RenderSystemInterfaceOptions {
  /** List of symbols to import, and their file paths */
  imports: ImportDatum[];
  name: string;
  functionPrefix: string;
  functions: ContractInterfaceFunction[];
  errors: ContractInterfaceError[];
}

export interface RenderSystemLibraryOptions {
  /** List of symbols to import, and their file paths */
  imports: ImportDatum[];
  systemLabel: string;
  interfaceName: string;
  libraryName: string;
  resourceId: string;
  functions: ContractInterfaceFunction[];
  errors: ContractInterfaceError[];

  /** Path for store package imports */
  storeImportPath: string;
  /** Path for world package imports */
  worldImportPath: string;
}
