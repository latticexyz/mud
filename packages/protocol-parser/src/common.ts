import { Schema } from "./Schema";

export type TableSchema = {
  keySchema: Schema;
  valueSchema: Schema;
};
