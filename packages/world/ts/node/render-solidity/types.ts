import type { ImportDatum, ContractInterfaceFunction, ContractInterfaceError } from "@latticexyz/common/codegen";

export interface RenderSystemInterfaceOptions {
  /** List of symbols to import, and their file paths */
  imports: ImportDatum[];
  name: string;
  functionPrefix: string;
  functions: ContractInterfaceFunction[];
  errors: ContractInterfaceError[];
}
