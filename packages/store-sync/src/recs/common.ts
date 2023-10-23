import { StoreConfig } from "@latticexyz/store";
import { Component as RecsComponent, Metadata as RecsMetadata, Type as RecsType } from "@latticexyz/recs";
import { SchemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";
import { Table } from "../common";
import { Hex } from "viem";

export type TableInput = Omit<Table, "address">;
export type TablesInput = Record<string, TableInput>;

export type StoreComponentMetadata = RecsMetadata & {
  componentName: string;
  tableName: string;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};

export type TableToRecsComponent<table extends TableInput> = RecsComponent<
  {
    __staticData: RecsType.OptionalString;
    __encodedLengths: RecsType.OptionalString;
    __dynamicData: RecsType.OptionalString;
  } & {
    [fieldName in keyof table["valueSchema"] & string]: RecsType &
      SchemaAbiTypeToRecsType<SchemaAbiType & table["valueSchema"][fieldName]>;
  },
  StoreComponentMetadata & {
    componentName: table["name"];
    tableName: `${table["namespace"]}:${table["name"]}`;
    keySchema: table["keySchema"];
    valueSchema: table["valueSchema"];
  }
>;

export type TablesToRecsComponents<tables extends TablesInput> = {
  [tableName in keyof tables]: TableToRecsComponent<tables[tableName]>;
};

export type ConfigToTables<config extends StoreConfig> = {
  [tableName in keyof config["tables"] & string]: {
    tableId: Hex;
    namespace: config["namespace"];
    name: tableName;
    keySchema: config["tables"][tableName]["keySchema"];
    valueSchema: config["tables"][tableName]["valueSchema"];
  };
};
