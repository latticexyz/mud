import { KeySchema, StoreConfig, ValueSchema } from "@latticexyz/store";
import { Component as RecsComponent, Type as RecsType } from "@latticexyz/recs";
import { SchemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";
import { SchemaAbiType } from "@latticexyz/schema-type";

export type StoreComponentMetadata = {
  componentName: string;
  tableName: string;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};

export type ConfigToRecsComponents<TConfig extends StoreConfig> = {
  [tableName in keyof TConfig["tables"] & string]: RecsComponent<
    {
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
