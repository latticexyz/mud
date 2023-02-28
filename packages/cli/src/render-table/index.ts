import { renderTable } from "./renderTable.js";
import { SchemaType, SchemaTypeArrayToElement, SchemaTypeId, getStaticByteLength } from "@latticexyz/schema-type";
import { StoreConfig } from "../config/loadStoreConfig.js";
import {
  RenderTableDynamicField,
  RenderTableField,
  RenderTablePrimaryKey,
  RenderTableStaticField,
  RenderTableType,
} from "./types.js";

export function renderTablesFromConfig(config: StoreConfig) {
  const storeImportPath = config.storeImportPath;

  const renderedTables = [];
  for (const tableName of Object.keys(config.tables)) {
    const tableData = config.tables[tableName];

    // struct adds methods to get/set all values at once
    const withStruct = tableData.dataStruct;
    // operate on all fields at once; for only 1 field keep them only if struct is also kept
    const withRecordMethods = withStruct || Object.keys(tableData.schema).length > 1;
    // field methods can be simply get/set if there's only 1 field and no record methods
    const noFieldMethodSuffix = !withRecordMethods && Object.keys(tableData.schema).length === 1;

    const primaryKeys = Object.keys(tableData.primaryKeys).map((name) => {
      const type = tableData.primaryKeys[name];
      const typeInfo = getSchemaTypeInfo(type);
      if (typeInfo.isDynamic) throw new Error("Parsing error: found dynamic primary key");

      const primaryKey: RenderTablePrimaryKey = {
        ...typeInfo,
        name,
        isDynamic: false,
      };
      return primaryKey;
    });

    const fields = Object.keys(tableData.schema).map((name) => {
      const type = tableData.schema[name];
      const elementType = SchemaTypeArrayToElement[type];
      const field: RenderTableField = {
        ...getSchemaTypeInfo(type),
        arrayElement: elementType ? getSchemaTypeInfo(elementType) : undefined,
        name,
        methodNameSuffix: noFeldMethodSuffix ? "" : `${name[0].toUpperCase()}${name.slice(1)}`,
      };
      return field;
    });

    const staticFields = fields.filter(({ isDynamic }) => !isDynamic) as RenderTableStaticField[];
    const dynamicFields = fields.filter(({ isDynamic }) => isDynamic) as RenderTableDynamicField[];

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
      output: renderTable({
        libraryName: tableName,
        structName: withStruct ? tableName + "Data" : undefined,
        staticRouteData,
        storeImportPath,
        primaryKeys,
        fields,
        staticFields,
        dynamicFields,
        withRecordMethods,
        storeArgument: tableData.storeArgument,
      }),
    });
  }
  return renderedTables;
}

function getSchemaTypeInfo(schemaType: SchemaType): RenderTableType {
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
