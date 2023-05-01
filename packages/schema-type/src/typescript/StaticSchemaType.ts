import { SchemaType } from "./SchemaType";
import { DynamicSchemaType } from "./DynamicSchemaType";

export type StaticSchemaType = Exclude<SchemaType, DynamicSchemaType>;
