import { Schema } from "@latticexyz/config";
import { AbiTypeToPrimitiveType } from "abitype";

// TODO: move to protocol-parser or similar

export type schemaToPrimitives<schema extends Schema> = {
  readonly [key in keyof schema]: AbiTypeToPrimitiveType<schema[key]["type"]>;
};
