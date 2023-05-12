import { SchemaType } from "../SchemaType";
import { ArraySchemaType } from "./ArraySchemaType";

export type DynamicSchemaType = ArraySchemaType | SchemaType.BYTES | SchemaType.STRING;
