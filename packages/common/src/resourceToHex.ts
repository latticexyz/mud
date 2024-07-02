import { Hex, stringToHex, concatHex } from "viem";
import { NAMESPACE_MAX_LENGTH, NAME_MAX_LENGTH, Resource } from "./common";
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
    stringToHex(resource.namespace.slice(0, NAMESPACE_MAX_LENGTH), { size: NAMESPACE_MAX_LENGTH }),
    stringToHex(resource.name.slice(0, NAME_MAX_LENGTH), { size: NAME_MAX_LENGTH }),
  ]);
}
