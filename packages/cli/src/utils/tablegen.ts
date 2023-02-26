import {
  renderSchema,
  RenderSchemaDynamicField,
  RenderSchemaField,
  RenderSchemaStaticField,
  RenderSchemaType,
} from "../contracts/renderSchema.js";
import { SchemaType, SchemaTypeArrayToElement, SchemaTypeId, getStaticByteLength } from "@latticexyz/schema-type";
import { StoreConfig } from "../config/loadStoreConfig.js";

export function renderTables(config: StoreConfig) {
  const storeImportPath = config.storeImportPath;

  const renderedTables = [];
  for (const tableName of Object.keys(config.tables)) {
    const tableData = config.tables[tableName];

    // struct adds methods to get/set all values at once
    let withStruct = tableData.dataStruct;
    if (Object.keys(tableData.schema).length > 1) {
      // TODO allow tuples for multicolumn tables
      withStruct = true;
    }
    // record methods aren't really supported without a struct
    const withRecordMethods = withStruct;
    // field methods can be simply get/set if there's only 1 field and no record methods
    const noFeldMethodSuffix = !withRecordMethods && Object.keys(tableData.schema).length === 1;

    const fields = Object.keys(tableData.schema).map((name) => {
      const type = tableData.schema[name];
      const elementType = SchemaTypeArrayToElement[type];
      const field: RenderSchemaField = {
        ...getSchemaTypeInfo(type),
        arrayElement: elementType ? getSchemaTypeInfo(elementType) : undefined,
        name,
        methodNameSuffix: noFeldMethodSuffix ? "" : `${name[0].toUpperCase()}${name.slice(1)}`,
      };
      return field;
    });

    const staticFields = fields.filter(({ isDynamic }) => !isDynamic) as RenderSchemaStaticField[];
    const dynamicFields = fields.filter(({ isDynamic }) => isDynamic) as RenderSchemaDynamicField[];

    // With tableIdArgument: tableId is a dynamic argument for each method
    // Without tableIdArgument: tableId is a file-level constant generated from `staticRouteData`
    const staticRouteData = (() => {
      if (tableData.tableIdArgument) {
        return;
      } else {
        return {
          tableIdName: tableName + "TableId",
          baseRoute: config.baseRoute + tableData.route,
          subRoute: `/${tableName}`,
        };
      }
    })();

    renderedTables.push({
      tableName,
      tableData,
      output: renderSchema({
        libraryName: tableName,
        structName: tableName + "Data",
        staticRouteData,
        storeImportPath,
        keyTuple: tableData.keyTuple,
        fields,
        staticFields,
        dynamicFields,
        withRecordMethods,
      }),
    });
  }
  return renderedTables;
}

function getSchemaTypeInfo(schemaType: SchemaType): RenderSchemaType {
  const staticByteLength = getStaticByteLength(schemaType);
  const isDynamic = staticByteLength === 0;
  const typeId = SchemaTypeId[schemaType];
  return {
    typeId,
    typeWithLocation: isDynamic ? typeId + " memory" : typeId,
    enumName: SchemaType[schemaType],
    staticByteLength,
    isDynamic,
  };
}
