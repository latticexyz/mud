import {
  ImportDatum,
  RenderDynamicField,
  RenderField,
  RenderKeyTuple,
  RenderStaticField,
  StaticResourceData,
} from "@latticexyz/common/codegen";

export interface RenderTableOptions {
  /** List of symbols to import, and their file paths */
  imports: ImportDatum[];
  /** Name of the library to render. */
  libraryName: string;
  /** Name of the struct to render. If undefined, struct and its methods aren't rendered. */
  structName?: string;
  /** Data used to statically registed the table. If undefined, all methods receive `_tableId` as an argument. */
  staticResourceData?: StaticResourceData;
  /** Path for store package imports */
  storeImportPath: string;
  keyTuple: RenderKeyTuple[];
  fields: RenderField[];
  staticFields: RenderStaticField[];
  dynamicFields: RenderDynamicField[];
  /** Whether to render getter functions */
  withGetters: boolean;
  /** Whether to render dynamic field methods (push, pop, update) */
  withDynamicFieldMethods: boolean;
  /** Whether to render get/set methods for the whole record */
  withRecordMethods: boolean;
  /** Whether to additionally render field methods without a field name suffix */
  withSuffixlessFieldMethods: boolean;
  /** Whether to render additional methods that accept a manual `IStore` argument */
  storeArgument: boolean;
}
