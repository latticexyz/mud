import { SchemaType } from "./SchemaType";
import { ArraySchemaType } from "./ArraySchemaType";

export { SchemaType };
export type { ArraySchemaType };

export type DynamicSchemaType = ArraySchemaType | SchemaType.BYTES | SchemaType.STRING;
export type StaticSchemaType = Omit<SchemaType, DynamicSchemaType>;

export { encodeSchema } from "./encodeSchema";
export { getStaticByteLength } from "./getStaticByteLength";
export { SchemaTypeArrayToElement } from "./SchemaTypeArrayToElement";
export { SchemaTypeId } from "./SchemaTypeId";
export type { SchemaTypeToPrimitive } from "./SchemaTypeToPrimitive";
