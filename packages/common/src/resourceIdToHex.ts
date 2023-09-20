import { Hex, stringToHex, concatHex } from "viem";
import { ResourceId } from "./common";
import { ResourceType } from "./resourceTypes";

/** @internal */
export const resourceTypeIds = {
  table: "tb",
  offchainTable: "ot",
} as const satisfies Record<ResourceType, string>;

export function resourceIdToHex(resourceId: ResourceId): Hex {
  const typeId = resourceTypeIds[resourceId.type];
  return concatHex([
    stringToHex(resourceId.namespace.slice(0, 14), { size: 14 }),
    stringToHex(resourceId.name.slice(0, 16), { size: 16 }),
    stringToHex(typeId, { size: 2 }),
  ]);
}
