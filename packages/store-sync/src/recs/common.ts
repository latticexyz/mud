import { StoreConfig } from "@latticexyz/store";
import { Component as RecsComponent, Metadata as RecsMetadata, Type as RecsType } from "@latticexyz/recs";
import { SchemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";

export type StoreComponentMetadata = RecsMetadata & {
  componentName: string;
  tableName: string;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};

export type ConfigToRecsComponents<TConfig extends StoreConfig> = {
  [tableName in keyof TConfig["tables"] & string]: RecsComponent<
    {
      __staticData: RecsType.OptionalString;
      __encodedLengths: RecsType.OptionalString;
      __dynamicData: RecsType.OptionalString;
    } & {
      [fieldName in keyof TConfig["tables"][tableName]["schema"] & string]: RecsType &
        SchemaAbiTypeToRecsType<SchemaAbiType & TConfig["tables"][tableName]["schema"][fieldName]>;
    },
    StoreComponentMetadata & {
      componentName: tableName;
      tableName: `${TConfig["namespace"]}:${tableName}`;
      keySchema: TConfig["tables"][tableName]["keySchema"];
      valueSchema: TConfig["tables"][tableName]["schema"];
    }
  >;
};
