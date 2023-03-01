export interface RenderTableOptions {
  /** Name of the library to render. */
  libraryName: string;
  /** Name of the struct to render. If undefined, struct and its methods aren't rendered. */
  structName?: string;
  /** Data used to statically registed the table. If undefined, all methods receive `_tableId` as an argument. */
  staticRouteData?: StaticRouteData;
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

export interface StaticRouteData {
  /** Name of the table id constant to render. */
  tableIdName: string;
  baseRoute: string;
  subRoute: string;
}

export interface RenderTableType {
  typeId: string;
  typeWithLocation: string;
  enumName: string;
  staticByteLength: number;
  isDynamic: boolean;
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
