import { conform } from "@arktype/util";
import { Store, Table } from "./output";
import { mapObject } from "@latticexyz/common/utils";

export type storeToV1<store> = store extends Store
  ? {
      namespace: store["namespace"];
      enums: { [key in keyof store["enums"]]: string[] };
      userTypes: {
        [key in keyof store["userTypes"]]: {
          internalType: store["userTypes"][key]["type"];
          filePath: string;
        };
      };
      storeImportPath: store["codegen"]["storeImportPath"];
      userTypesFilename: store["codegen"]["userTypesFilename"];
      codegenDirectory: store["codegen"]["codegenDirectory"];
      codegenIndexFilename: store["codegen"]["codegenIndexFilename"];
      tables: { [key in keyof store["tables"]]: tableToV1<store["tables"][key]> };
    }
  : never;

export type tableToV1<table extends Table> = {
  directory: table["codegen"]["directory"];
  dataStruct: table["codegen"]["dataStruct"];
  tableIdArgument: table["codegen"]["tableIdArgument"];
  storeArgument: table["codegen"]["storeArgument"];
  keySchema: { [key in keyof table["keySchema"]]: table["keySchema"][key]["internalType"] };
  valueSchema: { [key in keyof table["valueSchema"]]: table["valueSchema"][key]["internalType"] };
  offchainOnly: Table extends table ? boolean : table["type"] extends "table" ? false : true;
  tableId: table["tableId"];
  namespace: table["namespace"];
  name: table["name"];
};

export function storeToV1<store>(store: conform<store, Store>): storeToV1<store> {
  const resolvedUserTypes = mapObject(store.userTypes, ({ type, filePath }) => ({
    internalType: type,
    filePath,
  }));

  const resolvedTables = mapObject(store.tables, (table) => ({
    directory: table.codegen.directory,
    dataStruct: table.codegen.dataStruct,
    tableIdArgument: table.codegen.tableIdArgument,
    storeArgument: table.codegen.storeArgument,
    keySchema: mapObject(table.keySchema, (field) => field.internalType),
    valueSchema: mapObject(table.valueSchema, (field) => field.internalType),
    offchainOnly: table.type === "offchainTable",
    tableId: table.tableId,
    namespace: table.namespace,
    name: table.name,
  }));

  return {
    namespace: store.namespace,
    enums: store.enums,
    userTypes: resolvedUserTypes,
    storeImportPath: store.codegen.storeImportPath,
    userTypesFilename: store.codegen.userTypesFilename,
    codegenDirectory: store.codegen.codegenDirectory,
    codegenIndexFilename: store.codegen.codegenIndexFilename,
    tables: resolvedTables,
  } as unknown as storeToV1<store>;
}
