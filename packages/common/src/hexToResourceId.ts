import { Hex, hexToString, sliceHex } from "viem";
import { ResourceId } from "./common";
import { isResourceType } from "./isResourceType";

export function hexToResourceId(hex: Hex): ResourceId {
  const namespace = hexToString(sliceHex(hex, 0, 14)).replace(/\0+$/, "");
  const name = hexToString(sliceHex(hex, 14, 30)).replace(/\0+$/, "");
  const type = hexToString(sliceHex(hex, 30, 32)).replace(/\0+$/, "");

  if (!isResourceType(type)) {
    throw new Error(`Unknown resource type: ${type}`);
  }

  return { namespace, name, type };
}
