import { AbiType, StaticArray } from "@latticexyz/schema-type";
import { StringForUnion } from "./common";

// static arrays and inferred enum names get mixed together - this helper separates them
export type ExtractUserTypes<UnknownTypes extends StringForUnion> = Exclude<UnknownTypes, AbiType | StaticArray>;
