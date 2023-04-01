import { SchemaType } from "./SchemaType.js";
import { ArraySchemaType } from "./ArraySchemaType.js";

export type DynamicSchemaType = ArraySchemaType | SchemaType.BYTES | SchemaType.STRING;
