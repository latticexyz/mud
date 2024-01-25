import type {
  ImportDatum,
  RelativeImportDatum,
  ContractInterfaceFunction,
  ContractInterfaceError,
  ContractInterfaceStruct,
  ContractInterfaceEnum,
} from "@latticexyz/common/codegen";

export interface RenderSystemInterfaceOptions {
  /** List of symbols to import, and their file paths */
  imports: ImportDatum[];
  name: string;
  functionPrefix: string;
  functions: ContractInterfaceFunction[];
  errors: ContractInterfaceError[];
  structs: ContractInterfaceStruct[];
  enums: ContractInterfaceEnum[];
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
