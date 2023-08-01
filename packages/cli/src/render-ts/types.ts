import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";

export interface RecsV1TableOptions {
  tables: {
    tableName: string;
    keySchema: Record<string, StaticAbiType>;
    valueSchema: Record<string, SchemaAbiType>;
    fields: {
      recsTypeString: string;
      name: string;
    }[];
    staticResourceData: {
      namespace: string;
      name: string;
    };
  }[];
}
