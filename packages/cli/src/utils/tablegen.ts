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

    const fields = Object.keys(tableData.schema).map((name) => {
      const type = tableData.schema[name];
      const elementType = SchemaTypeArrayToElement[type];
      const field: RenderSchemaField = {
        ...getSchemaTypeInfo(type),
        arrayElement: elementType ? getSchemaTypeInfo(elementType) : undefined,
        name,
        methodName: `${name[0].toUpperCase()}${name.slice(1)}`,
      };
      return field;
    });

    const staticFields = fields.filter(({ isDynamic }) => !isDynamic) as RenderSchemaStaticField[];
    const dynamicFields = fields.filter(({ isDynamic }) => isDynamic) as RenderSchemaDynamicField[];

    // With schemaMode: tableId is a dynamic argument for each method
    // Without schemaMode: tableId is a file-level constant generated from `staticRoute`
    const staticRoute = (() => {
      if (tableData.schemaMode) {
        return;
      } else {
        return {
          baseRoute: config.baseRoute + tableData.route,
          subRoute: `/${tableName}`,
        };
      }
    })();

    renderedTables.push({
      tableName,
      tableData,
      output: renderSchema({
        staticRoute,
        storeImportPath,
        tableName,
        keyTuple: tableData.keyTuple,
        fields,
        staticFields,
        dynamicFields,
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
