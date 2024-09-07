import path from "node:path/posix";
import { SchemaTypeArrayToElement } from "@latticexyz/schema-type/deprecated";
import { RenderDynamicField, RenderField, RenderKeyTuple, RenderStaticField } from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";
import { getSchemaTypeInfo, resolveAbiOrUserType } from "./userType";
import { Table } from "../config/v2/output";
import { getKeySchema, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { UserType } from "./getUserTypes";
import { isDefined } from "@latticexyz/common/utils";
import { ImportDatum } from "@latticexyz/common/codegen";

export interface TableOptions {
  /** Path where the file is expected to be written (relative to project root) */
  outputPath: string;
  /** Name of the table, as used in filename and library name */
  tableName: string;
  /** Options for `renderTable` function */
  renderOptions: RenderTableOptions;
}

/**
 * Transforms store config and available solidity user types into useful options for `tablegen` and `renderTable`
 */
export function getTableOptions({
  tables,
  rootDir,
  codegenDir,
  userTypes,
  storeImportPath,
}: {
  readonly tables: Table[];
  readonly rootDir: string;
  /** namespace codegen output dir, relative to project root dir */
  readonly codegenDir: string;
  readonly userTypes: readonly UserType[];
  /** absolute import path or, if starting with `.`, relative to project root dir */
  readonly storeImportPath: string;
}): TableOptions[] {
  const options = tables.map((table): TableOptions => {
    const outputPath = path.join(rootDir, codegenDir, table.codegen.outputDirectory, `${table.label}.sol`);

    const keySchema = getKeySchema(table);
    const valueSchema = getValueSchema(table);

    // struct adds methods to get/set all values at once
    const withStruct = table.codegen.dataStruct;
    // operate on all fields at once; always render for offchain tables; for only 1 field keep them if struct is also kept
    const withRecordMethods = withStruct || table.type === "offchainTable" || Object.keys(valueSchema).length > 1;
    // field methods can include simply get/set if there's only 1 field and no record methods
    const withSuffixlessFieldMethods = !withRecordMethods && Object.keys(valueSchema).length === 1;
    // list of any symbols that need to be imported
    const imports = Object.values(table.schema)
      .map((field) => userTypes.find((type) => type.name === field.internalType))
      .filter(isDefined)
      .map((userType): ImportDatum => {
        return {
          // If it's a fully qualified name, remove trailing references
          // This enables support for user types inside libraries
          symbol: userType.name.replace(/\..*$/, ""),
          path: userType.importPath.startsWith(".")
            ? "./" + path.relative(path.dirname(outputPath), path.join(rootDir, userType.importPath))
            : userType.importPath,
        };
      });

    const keyTuple = Object.entries(keySchema).map(([name, field]): RenderKeyTuple => {
      const { renderType } = resolveAbiOrUserType(field.internalType, userTypes);

      return {
        ...renderType,
        name,
        isDynamic: false,
      };
    });

    const fields = Object.entries(valueSchema).map(([name, field]): RenderField => {
      const { renderType, schemaType } = resolveAbiOrUserType(field.internalType, userTypes);

      const elementType = SchemaTypeArrayToElement[schemaType];
      return {
        ...renderType,
        arrayElement: elementType !== undefined ? getSchemaTypeInfo(elementType) : undefined,
        name,
      };
    });

    const staticFields = fields.filter(({ isDynamic }) => !isDynamic) as RenderStaticField[];
    const dynamicFields = fields.filter(({ isDynamic }) => isDynamic) as RenderDynamicField[];

    // With tableIdArgument: tableId is a dynamic argument for each method
    // Without tableIdArgument: tableId is a file-level constant generated from `staticResourceData`
    const staticResourceData = table.codegen.tableIdArgument
      ? undefined
      : {
          namespace: table.namespace,
          name: table.name,
          offchainOnly: table.type === "offchainTable",
        };

    return {
      outputPath,
      tableName: table.label,
      renderOptions: {
        imports,
        libraryName: table.label,
        structName: withStruct ? table.label + "Data" : undefined,
        staticResourceData,
        storeImportPath: storeImportPath.startsWith(".")
          ? "./" + path.relative(path.dirname(outputPath), path.join(rootDir, storeImportPath))
          : storeImportPath,
        keyTuple,
        fields,
        staticFields,
        dynamicFields,
        withGetters: table.type === "table",
        withRecordMethods,
        withDynamicFieldMethods: table.type === "table",
        withSuffixlessFieldMethods,
        storeArgument: table.codegen.storeArgument,
      },
    };
  });

  return options;
}
