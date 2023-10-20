import { StoreConfig } from "@latticexyz/store";
import { Component as RecsComponent, Metadata as RecsMetadata, Type as RecsType } from "@latticexyz/recs";
import { SchemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";
import { Table } from "../common";
import { Hex } from "viem";

export type StoreComponentMetadata = RecsMetadata & {
  componentName: string;
  tableName: string;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};

export type TableToRecsComponent<table extends Omit<Table, "address">> = RecsComponent<
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

export type TablesToRecsComponents<tables extends Record<string, Omit<Table, "address">>> = {
  [tableName in keyof tables]: TableToRecsComponent<tables[tableName]>;
};

export type ConfigToRecsComponents<config extends StoreConfig> = {
  [tableName in keyof config["tables"] & string]: TableToRecsComponent<{
    tableId: Hex;
    namespace: config["namespace"];
    name: tableName;
    keySchema: config["tables"][tableName]["keySchema"] & KeySchema;
    valueSchema: config["tables"][tableName]["valueSchema"] & ValueSchema;
  }>;
};
