import { SchemaType } from "./SchemaType.js";
import { DynamicSchemaType } from "./DynamicSchemaType";

export type StaticSchemaType = Exclude<SchemaType, DynamicSchemaType>;
