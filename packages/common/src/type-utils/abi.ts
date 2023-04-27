import { AbiType, StaticAbiType } from "@latticexyz/schema-type";
import { StringForUnion } from "./common";

export type StaticArray = `${StaticAbiType}[${number}]`;
// static arrays and inferred enum names get mixed together - this helper separates them
export type ExtractUserTypes<UnknownTypes extends StringForUnion> = Exclude<UnknownTypes, AbiType | StaticArray>;
