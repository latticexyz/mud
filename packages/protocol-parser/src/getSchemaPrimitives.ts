import { Schema } from "@latticexyz/config";
import { AbiTypeToPrimitiveType } from "abitype";

export type getSchemaPrimitives<schema extends Schema> = {
  readonly [fieldName in keyof schema]: AbiTypeToPrimitiveType<schema[fieldName]["type"]>;
};
