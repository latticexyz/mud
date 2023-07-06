import path from "path";
import { SchemaTypeArrayToElement } from "@latticexyz/schema-type/deprecated";
import {
  RelativeImportDatum,
  RenderDynamicField,
  RenderField,
  RenderKeyTuple,
  RenderStaticField,
} from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";
import { flattenTables, StoreConfig } from "../config";
import { getSchemaTypeInfo, importForAbiOrUserType, resolveAbiOrUserType } from "./userType";

export interface TableOptions {
  outputPath: string;
  selectorName: string;
  renderOptions: RenderTableOptions;
}

export function getTableOptions(config: StoreConfig): TableOptions[] {
  const storeImportPath = config.storeImportPath;
  const tables = flattenTables(config.namespaces);

  const options = [];
  for (const tableData of tables) {
    const selectorName = tableData.namespace === "" ? tableData.name : `${tableData.namespace}_${tableData.name}`;

    // struct adds methods to get/set all values at once
    const withStruct = tableData.dataStruct;
    // operate on all fields at once; for only 1 field keep them only if struct is also kept
    const withRecordMethods = withStruct || Object.keys(tableData.schema).length > 1;
    // field methods can be simply get/set if there's only 1 field and no record methods
    const noFieldMethodSuffix = !withRecordMethods && Object.keys(tableData.schema).length === 1;
    // list of any symbols that need to be imported
    const imports: RelativeImportDatum[] = [];

    const keyTuple = Object.keys(tableData.keySchema).map((name) => {
      const abiOrUserType = tableData.keySchema[name];
      const { renderType } = resolveAbiOrUserType(abiOrUserType, config);

      const importDatum = importForAbiOrUserType(abiOrUserType, tableData.directory, config);
      if (importDatum) imports.push(importDatum);

      if (renderType.isDynamic) throw new Error(`Parsing error: found dynamic key ${name} in table ${selectorName}`);

      const keyTuple: RenderKeyTuple = {
        ...renderType,
        name,
        isDynamic: false,
      };
      return keyTuple;
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
          tableIdName: selectorName + "TableId",
          namespace: tableData.namespace,
          name: tableData.name,
        };
      }
    })();

    options.push({
      outputPath: path.join(tableData.directory, `${selectorName}.sol`),
      selectorName,
      renderOptions: {
        imports,
        libraryName: selectorName,
        structName: withStruct ? selectorName + "Data" : undefined,
        staticResourceData,
        storeImportPath,
        keyTuple,
        fields,
        staticFields,
        dynamicFields,
        withFieldMethods: !tableData.ephemeral,
        withRecordMethods: withRecordMethods && !tableData.ephemeral,
        withEphemeralMethods: tableData.ephemeral,
        storeArgument: tableData.storeArgument,
      },
    });
  }
  return options;
}
