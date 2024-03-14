import { conform, mutable } from "@arktype/util";
import { Config, Table } from "./output";

export type configToV1<config> = config extends Config
  ? {
      namespace: config["namespace"];
      enums: mutable<config["enums"], 2>;
      userTypes: {
        [key in keyof config["userTypes"]]: {
          internalType: config["userTypes"][key];
          // TODO: add to v2 config
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
  offchainOnly: table["type"] extends "offchainTable" ? true : false;
  name: table["name"];
};

export function configToV1<config>(config: conform<config, Config>): configToV1<config> {
  return {} as never;
}
