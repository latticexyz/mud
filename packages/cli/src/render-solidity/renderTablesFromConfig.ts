import path from "path";
import { renderTable } from "./renderTable.js";
import { SchemaType, SchemaTypeArrayToElement, SchemaTypeId, getStaticByteLength } from "@latticexyz/schema-type";
import { StoreConfig } from "../config/parseStoreConfig.js";
import {
  RenderTableDynamicField,
  RenderTableField,
  RenderTablePrimaryKey,
  RenderTableStaticField,
  RenderTableType,
} from "./types.js";
import { resolveSchemaOrUserType } from "./userType.js";

export function renderTablesFromConfig(config: StoreConfig, srcDirectory: string) {
  const storeImportPath = config.storeImportPath;

  const renderedTables = [];
  for (const tableName of Object.keys(config.tables)) {
    const tableData = config.tables[tableName];
    const outputDirectory = path.join(srcDirectory, tableData.directory);

    // struct adds methods to get/set all values at once
    const withStruct = tableData.dataStruct;
    // operate on all fields at once; for only 1 field keep them only if struct is also kept
    const withRecordMethods = withStruct || Object.keys(tableData.schema).length > 1;
    // field methods can be simply get/set if there's only 1 field and no record methods
    const noFieldMethodSuffix = !withRecordMethods && Object.keys(tableData.schema).length === 1;

    const primaryKeys = Object.keys(tableData.primaryKeys).map((name) => {
      const schemaOrUserType = tableData.primaryKeys[name];
      const { schemaType, userTypeDetails } = resolveSchemaOrUserType(
        schemaOrUserType,
        outputDirectory,
        config.userTypes
      );

      const typeInfo = getSchemaTypeInfo(schemaType);
      if (typeInfo.isDynamic) throw new Error("Parsing error: found dynamic primary key");

      const primaryKey: RenderTablePrimaryKey = {
        ...typeInfo,
        name,
        isDynamic: false,
        userTypeDetails,
      };
      return primaryKey;
    });

    const fields = Object.keys(tableData.schema).map((name) => {
      const schemaOrUserType = tableData.schema[name];
      const { schemaType, userTypeDetails } = resolveSchemaOrUserType(
        schemaOrUserType,
        outputDirectory,
        config.userTypes
      );

      const elementType = SchemaTypeArrayToElement[schemaType];
      const field: RenderTableField = {
        ...getSchemaTypeInfo(schemaType),
        arrayElement: elementType ? getSchemaTypeInfo(elementType) : undefined,
        name,
        methodNameSuffix: noFieldMethodSuffix ? "" : `${name[0].toUpperCase()}${name.slice(1)}`,
        userTypeDetails,
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
          baseRoute: config.baseRoute,
          subRoute: tableData.route,
        };
      }
    })();

    renderedTables.push({
      outputDirectory,
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

export function getSchemaTypeInfo(schemaType: SchemaType): RenderTableType {
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
