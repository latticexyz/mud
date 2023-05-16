import {
  RelativeImportDatum,
  RenderDynamicField,
  RenderField,
  RenderPrimaryKey,
  RenderStaticField,
  StaticResourceData,
} from "@latticexyz/common/codegen";

export interface RenderTableOptions {
  /** List of symbols to import, and their file paths */
  imports: RelativeImportDatum[];
  /** Name of the library to render. */
  libraryName: string;
  /** Name of the struct to render. If undefined, struct and its methods aren't rendered. */
  structName?: string;
  /** Data used to statically registed the table. If undefined, all methods receive `_tableId` as an argument. */
  staticResourceData?: StaticResourceData;
  /** Path for store package imports */
  storeImportPath: string;
  keySchema: RenderPrimaryKey[];
  fields: RenderField[];
  staticFields: RenderStaticField[];
  dynamicFields: RenderDynamicField[];
  /** Whether to render methods for individual fields (get/set, and more for dynamic elements) */
  withFieldMethods: boolean;
  /** Whether to render get/set methods for the whole record */
  withRecordMethods: boolean;
  /** Whether to render emitEphemeral methods */
  withEphemeralMethods: boolean;
  /** Whether to render additional methods that accept a manual `IStore` argument */
  storeArgument: boolean;
}
