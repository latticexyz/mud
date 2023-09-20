import { Hex, stringToHex, concatHex } from "viem";
import { ResourceId } from "./common";

export function resourceIdToHex(resourceId: ResourceId): Hex {
  return concatHex([
    stringToHex(resourceId.namespace.substring(0, 14), { size: 14 }),
    stringToHex(resourceId.name.substring(0, 16), { size: 16 }),
    stringToHex(resourceId.type.substring(0, 2), { size: 2 }),
  ]);
}
