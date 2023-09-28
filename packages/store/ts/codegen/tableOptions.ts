import path from "path";
import { SchemaTypeArrayToElement } from "@latticexyz/schema-type/deprecated";
import {
  ImportDatum,
  RenderDynamicField,
  RenderField,
  RenderKeyTuple,
  RenderStaticField,
  SolidityUserDefinedType,
} from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";
import { StoreConfig } from "../config";
import { getSchemaTypeInfo, importForAbiOrUserType, resolveAbiOrUserType } from "./userType";

export interface TableOptions {
  outputPath: string;
  tableName: string;
  renderOptions: RenderTableOptions;
}

export function getTableOptions(
  config: StoreConfig,
  solidityUserTypes: Record<string, SolidityUserDefinedType>
): TableOptions[] {
  const storeImportPath = config.storeImportPath;

  const options = [];
  for (const tableName of Object.keys(config.tables)) {
    const tableData = config.tables[tableName];

    // struct adds methods to get/set all values at once
    const withStruct = tableData.dataStruct;
    // operate on all fields at once; always render for offchain tables; for only 1 field keep them if struct is also kept
    const withRecordMethods = withStruct || tableData.offchainOnly || Object.keys(tableData.valueSchema).length > 1;
    // field methods can include simply get/set if there's only 1 field and no record methods
    const withSuffixlessFieldMethods = !withRecordMethods && Object.keys(tableData.valueSchema).length === 1;
    // list of any symbols that need to be imported
    const imports: ImportDatum[] = [];

    const keyTuple = Object.keys(tableData.keySchema).map((name) => {
      const abiOrUserType = tableData.keySchema[name];
      const { renderType } = resolveAbiOrUserType(abiOrUserType, config, solidityUserTypes);

      const importDatum = importForAbiOrUserType(abiOrUserType, tableData.directory, config, solidityUserTypes);
      if (importDatum) imports.push(importDatum);

      if (renderType.isDynamic) throw new Error(`Parsing error: found dynamic key ${name} in table ${tableName}`);

      const keyTuple: RenderKeyTuple = {
        ...renderType,
        name,
        isDynamic: false,
      };
      return keyTuple;
    });

    const fields = Object.keys(tableData.valueSchema).map((name) => {
      const abiOrUserType = tableData.valueSchema[name];
      const { renderType, schemaType } = resolveAbiOrUserType(abiOrUserType, config, solidityUserTypes);

      const importDatum = importForAbiOrUserType(abiOrUserType, tableData.directory, config, solidityUserTypes);
      if (importDatum) imports.push(importDatum);

      const elementType = SchemaTypeArrayToElement[schemaType];
      const field: RenderField = {
        ...renderType,
        arrayElement: elementType !== undefined ? getSchemaTypeInfo(elementType) : undefined,
        name,
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
          offchainOnly: tableData.offchainOnly,
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
        keyTuple,
        fields,
        staticFields,
        dynamicFields,
        withGetters: !tableData.offchainOnly,
        withRecordMethods,
        withDynamicFieldMethods: !tableData.offchainOnly,
        withSuffixlessFieldMethods,
        storeArgument: tableData.storeArgument,
      },
    });
  }
  return options;
}
