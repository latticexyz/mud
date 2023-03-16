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
  primaryKeys: RenderTablePrimaryKey[];
  fields: RenderTableField[];
  staticFields: RenderTableStaticField[];
  dynamicFields: RenderTableDynamicField[];
  /** Whether to render get/set methods for the whole record */
  withRecordMethods: boolean;
  /** Whether to render additional methods that accept a manual `IStore` argument */
  storeArgument: boolean;
}

export interface ImportDatum {
  symbol: string;
  fromPath: string;
  usedInPath: string;
}

export interface StaticResourceData {
  /** Name of the table id constant to render. */
  tableIdName: string;
  namespace: string;
  fileSelector: string;
}

export interface RenderTableType {
  typeId: string;
  typeWithLocation: string;
  /** The name of the enum element in SchemaType to use for schema registration (e.g. "UINT256_ARRAY") */
  enumName: string;
  staticByteLength: number;
  isDynamic: boolean;
  /** Empty for internal types. Custom `wrap` method for user defined types. */
  typeWrap: string;
  /** Empty for internal types. Custom `unwrap` method for user defined types. */
  typeUnwrap: string;
  /** Same as typeId for internal types. The underlying `typeId` for user defined types. */
  internalTypeId: string;
}

export interface RenderTablePrimaryKey extends RenderTableType {
  name: string;
  isDynamic: false;
}

export interface RenderTableStaticField extends RenderTableField {
  isDynamic: false;
}

export interface RenderTableDynamicField extends RenderTableField {
  isDynamic: true;
}

export interface RenderTableField extends RenderTableType {
  arrayElement: RenderTableType | undefined;
  name: string;
  methodNameSuffix: string;
}

export interface RenderTypesOptions {
  /** List of enums to render */
  enums: RenderTypesEnum[];
}

export interface RenderTypesEnum {
  name: string;
  memberNames: string[];
}

export interface RenderSystemInterfaceOptions {
  /** List of symbols to import, and their file paths */
  imports: ImportDatum[];
  name: string;
  functionPrefix: string;
  functions: RenderSystemInterfaceFunction[];
}

export interface RenderSystemInterfaceFunction {
  name: string;
  parameters: string[];
  returnParameters: string[];
}

export interface RenderWorldOptions {
  /** List of symbols to import, and their file paths */
  imports: ImportDatum[];
  /** Name of the interface to render */
  interfaceName: string;
  /** Path for store package imports */
  storeImportPath: string;
  /** Path for world package imports */
  worldImportPath: string;
}
