import path from "path";
import { renderTable } from "./renderTable.js";
import { SchemaTypeArrayToElement } from "@latticexyz/schema-type";
import { StoreConfig } from "../config/parseStoreConfig.js";
import {
  ImportDatum,
  RenderTableDynamicField,
  RenderTableField,
  RenderTablePrimaryKey,
  RenderTableStaticField,
} from "./types.js";
import { getSchemaTypeInfo, resolveSchemaOrUserType } from "./userType.js";

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
    // list of any symbols that need to be imported
    const imports: ImportDatum[] = [];

    const primaryKeys = Object.keys(tableData.primaryKeys).map((name) => {
      const schemaOrUserType = tableData.primaryKeys[name];
      const { renderTableType, importDatum } = resolveSchemaOrUserType(
        schemaOrUserType,
        srcDirectory,
        outputDirectory,
        config.userTypes
      );
      if (importDatum) imports.push(importDatum);

      if (renderTableType.isDynamic)
        throw new Error(`Parsing error: found dynamic primary key ${name} in table ${tableName}`);

      const primaryKey: RenderTablePrimaryKey = {
        ...renderTableType,
        name,
        isDynamic: false,
      };
      return primaryKey;
    });

    const fields = Object.keys(tableData.schema).map((name) => {
      const schemaOrUserType = tableData.schema[name];
      const { renderTableType, importDatum, schemaType } = resolveSchemaOrUserType(
        schemaOrUserType,
        srcDirectory,
        outputDirectory,
        config.userTypes
      );
      if (importDatum) imports.push(importDatum);

      const elementType = SchemaTypeArrayToElement[schemaType];
      const field: RenderTableField = {
        ...renderTableType,
        arrayElement: elementType !== undefined ? getSchemaTypeInfo(elementType) : undefined,
        name,
        methodNameSuffix: noFieldMethodSuffix ? "" : `${name[0].toUpperCase()}${name.slice(1)}`,
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
        imports,
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
