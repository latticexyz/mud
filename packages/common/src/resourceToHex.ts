import { Hex, stringToHex, concatHex } from "viem";
import { Resource } from "./common";
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

export function resourceToHex(resource: Omit<Resource, "resourceId">): Hex {
  const typeId = resourceTypeIds[resource.type];
  return concatHex([
    stringToHex(typeId, { size: 2 }),
    stringToHex(resource.namespace.slice(0, 14), { size: 14 }),
    stringToHex(resource.name.slice(0, 16), { size: 16 }),
  ]);
}
