export interface RecsV1TableOptions {
  tables: {
    tableName: string;
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
