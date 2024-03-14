import { conform } from "@arktype/util";
import { Config, Table } from "./output";
import { mapObject } from "@latticexyz/common/utils";

export type configToV1<config> = config extends Config
  ? {
      namespace: config["namespace"];
      enums: { [key in keyof config["enums"]]: string[] };
      userTypes: {
        [key in keyof config["userTypes"]]: {
          internalType: config["userTypes"][key]["type"];
          filePath: string;
        };
      };
      storeImportPath: config["codegen"]["storeImportPath"];
      userTypesFilename: config["codegen"]["userTypesFilename"];
      codegenDirectory: config["codegen"]["codegenDirectory"];
      codegenIndexFilename: config["codegen"]["codegenIndexFilename"];
      tables: { [key in keyof config["tables"]]: tableToV1<config["tables"][key]> };
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
  name: table["name"];
};

export function configToV1<config>(config: conform<config, Config>): configToV1<config> {
  const resolvedUserTypes = mapObject(config.userTypes, ({ type, filePath }) => ({
    internalType: type,
    filePath,
  }));

  const resolvedTables = mapObject(config.tables, (table) => ({
    directory: table.codegen.directory,
    dataStruct: table.codegen.dataStruct,
    tableIdArgument: table.codegen.tableIdArgument,
    storeArgument: table.codegen.storeArgument,
    keySchema: mapObject(table.keySchema, (field) => field.internalType),
    valueSchema: mapObject(table.valueSchema, (field) => field.internalType),
    offchainOnly: table.type === "offchainTable",
    name: table.name,
  }));

  return {
    namespace: config.namespace,
    enums: config.enums,
    userTypes: resolvedUserTypes,
    storeImportPath: config.codegen.storeImportPath,
    userTypesFilename: config.codegen.userTypesFilename,
    codegenDirectory: config.codegen.codegenDirectory,
    codegenIndexFilename: config.codegen.codegenIndexFilename,
    tables: resolvedTables,
  } as unknown as configToV1<config>;
}
