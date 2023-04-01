import { SchemaType } from "./SchemaType.js";
import { DynamicSchemaType } from "./DynamicSchemaType.js";

export type StaticSchemaType = Exclude<SchemaType, DynamicSchemaType>;
