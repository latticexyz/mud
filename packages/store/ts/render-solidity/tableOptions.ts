import path from "path";
import { SchemaTypeArrayToElement } from "@latticexyz/schema-type";
import { StoreConfig } from "@latticexyz/config";
import {
  getSchemaTypeInfo,
  RelativeImportDatum,
  importForAbiOrUserType,
  RenderDynamicField,
  RenderField,
  RenderPrimaryKey,
  RenderStaticField,
  resolveAbiOrUserType,
} from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";

export interface TableOptions {
  outputPath: string;
  tableName: string;
  renderOptions: RenderTableOptions;
}

export function getTableOptions(config: StoreConfig): TableOptions[] {
  const storeImportPath = config.storeImportPath;

  const options = [];
  for (const tableName of Object.keys(config.tables)) {
    const tableData = config.tables[tableName];

    // struct adds methods to get/set all values at once
    const withStruct = tableData.dataStruct;
    // operate on all fields at once; for only 1 field keep them only if struct is also kept
    const withRecordMethods = withStruct || Object.keys(tableData.schema).length > 1;
    // field methods can be simply get/set if there's only 1 field and no record methods
    const noFieldMethodSuffix = !withRecordMethods && Object.keys(tableData.schema).length === 1;
    // list of any symbols that need to be imported
    const imports: RelativeImportDatum[] = [];

    const primaryKeys = Object.keys(tableData.primaryKeys).map((name) => {
      const abiOrUserType = tableData.primaryKeys[name];
      const { renderType } = resolveAbiOrUserType(abiOrUserType, config);

      const importDatum = importForAbiOrUserType(abiOrUserType, tableData.directory, config);
      if (importDatum) imports.push(importDatum);

      if (renderType.isDynamic)
        throw new Error(`Parsing error: found dynamic primary key ${name} in table ${tableName}`);

      const primaryKey: RenderPrimaryKey = {
        ...renderType,
        name,
        isDynamic: false,
      };
      return primaryKey;
    });

    const fields = Object.keys(tableData.schema).map((name) => {
      const abiOrUserType = tableData.schema[name];
      const { renderType, schemaType } = resolveAbiOrUserType(abiOrUserType, config);

      const importDatum = importForAbiOrUserType(abiOrUserType, tableData.directory, config);
      if (importDatum) imports.push(importDatum);

      const elementType = SchemaTypeArrayToElement[schemaType];
      const field: RenderField = {
        ...renderType,
        arrayElement: elementType !== undefined ? getSchemaTypeInfo(elementType) : undefined,
        name,
        methodNameSuffix: noFieldMethodSuffix ? "" : `${name[0].toUpperCase()}${name.slice(1)}`,
      };
      return field;
    });

    const staticFields = fields.filter(({ isDynamic }) => !isDynamic) as RenderStaticField[];
    const dynamicFields = fields.filter(({ isDynamic }) => isDynamic) as RenderDynamicField[];

    // With tableIdArgument: tableId is a dynamic argument for each method
    // Without tableIdArgument: tableId is a file-level constant generated from `staticResourceData`
    const staticResourceData = (() => {
      if (tableData.tableIdArgument) {
        return;
      } else {
        return {
          tableIdName: tableName + "TableId",
          namespace: config.namespace,
          name: tableData.name,
        };
      }
    })();

    options.push({
      outputPath: path.join(tableData.directory, `${tableName}.sol`),
      tableName,
      renderOptions: {
        imports,
        libraryName: tableName,
        structName: withStruct ? tableName + "Data" : undefined,
        staticResourceData,
        storeImportPath,
        primaryKeys,
        fields,
        staticFields,
        dynamicFields,
        withRecordMethods,
        storeArgument: tableData.storeArgument,
      },
    });
  }
  return options;
}
