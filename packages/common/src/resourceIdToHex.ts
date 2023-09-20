import { Hex, stringToHex, concatHex } from "viem";
import { ResourceId } from "./common";
import { ResourceType } from "./resourceTypes";

/** @internal */
export const resourceTypeIds = {
  // keep these in sync with storeResourceTypes.sol
  table: "tb",
  offchainTable: "ot",
  // keep these in sync with worldResourceTypes.sol
  namespace: "ns",
  module: "md",
  system: "sy",
} as const satisfies Record<ResourceType, string>;

export function resourceIdToHex(resourceId: ResourceId): Hex {
  const typeId = resourceTypeIds[resourceId.type];
  return concatHex([
    stringToHex(resourceId.namespace.slice(0, 14), { size: 14 }),
    stringToHex(resourceId.name.slice(0, 16), { size: 16 }),
    stringToHex(typeId, { size: 2 }),
  ]);
}
