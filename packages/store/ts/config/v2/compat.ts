import { conform } from "@arktype/util";
import { Schema, Store, Table } from "./output";
import { mapObject } from "@latticexyz/common/utils";
import { getKeySchema, getValueSchema } from "@latticexyz/protocol-parser/internal";

export type storeToV1<store> = store extends Store
  ? {
      namespace: store["namespace"] extends "" ? "" : string;
      enums: { [key in keyof store["enums"]]: string[] };
      userTypes: {
        [key in keyof store["userTypes"]]: {
          internalType: store["userTypes"][key]["type"];
          filePath: string;
        };
      };
      storeImportPath: store["codegen"]["storeImportPath"];
      userTypesFilename: store["codegen"]["userTypesFilename"];
      codegenDirectory: store["codegen"]["outputDirectory"];
      codegenIndexFilename: store["codegen"]["indexFilename"];
      tables: {
        [key in keyof store["tables"] as store["tables"][key]["name"]]: tableToV1<store["tables"][key]>;
      };
      v2: store;
    }
  : never;

type schemaToV1<schema extends Schema> = { [key in keyof schema]: schema[key]["internalType"] };

export type tableToV1<table extends Table> = {
  directory: table["codegen"]["outputDirectory"];
  dataStruct: table["codegen"]["dataStruct"];
  tableIdArgument: table["codegen"]["tableIdArgument"];
  storeArgument: table["codegen"]["storeArgument"];
  keySchema: schemaToV1<getKeySchema<table>>;
  valueSchema: schemaToV1<getValueSchema<table>>;
  offchainOnly: Table extends table ? boolean : table["type"] extends "table" ? false : true;
  name: table["name"];
};

export function storeToV1<store>(store: conform<store, Store>): storeToV1<store> {
  const resolvedUserTypes = mapObject(store.userTypes, ({ type, filePath }) => ({
    internalType: type,
    filePath,
  }));

  const resolvedTables = Object.fromEntries(
    Object.values(store.tables).map((table) => {
      return [
        table.name,
        {
          directory: table.codegen.outputDirectory,
          dataStruct: table.codegen.dataStruct,
          tableIdArgument: table.codegen.tableIdArgument,
          storeArgument: table.codegen.storeArgument,
          keySchema: mapObject(getKeySchema(table), (field) => field.internalType),
          valueSchema: mapObject(getValueSchema(table), (field) => field.internalType),
          offchainOnly: table.type === "offchainTable",
          name: table.name,
        },
      ];
    }),
  );

  return {
    namespace: store.namespace,
    enums: store.enums,
    userTypes: resolvedUserTypes,
    storeImportPath: store.codegen.storeImportPath,
    userTypesFilename: store.codegen.userTypesFilename,
    codegenDirectory: store.codegen.outputDirectory,
    codegenIndexFilename: store.codegen.indexFilename,
    tables: resolvedTables,
    v2: store,
  } as never;
}
