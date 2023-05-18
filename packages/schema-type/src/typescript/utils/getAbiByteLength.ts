import { AbiType } from "abitype";
import { getStaticByteLength } from "./getStaticByteLength";
import { AbiTypeToSchemaType } from "../mappings";

export function getAbiByteLength(abiType: AbiType) {
  return getStaticByteLength(AbiTypeToSchemaType[abiType]);
}
