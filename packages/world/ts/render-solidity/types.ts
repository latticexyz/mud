import type { RelativeImportDatum, ContractInterfaceFunction } from "@latticexyz/common/codegen";

export interface RenderSystemInterfaceOptions {
  /** List of symbols to import, and their file paths */
  imports: RelativeImportDatum[];
  name: string;
  functionPrefix: string;
  functions: ContractInterfaceFunction[];
}

export interface RenderWorldOptions {
  /** List of symbols to import, and their file paths */
  imports: RelativeImportDatum[];
  /** Name of the interface to render */
  interfaceName: string;
  /** Path for store package imports */
  storeImportPath: string;
  /** Path for world package imports */
  worldImportPath: string;
}
