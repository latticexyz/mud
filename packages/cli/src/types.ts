import { ContractSchemaType } from "./schemaType";

// TODO unfinished placeholder
export interface MUDConfig {
  route?: string;
  tables: {
    [name: string]: {
      route?: string;
      keys?: string[];
      schema: {
        [valueName: string]: ContractSchemaType;
      };
    };
  };
}

export * from "./schemaType";
