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
  system: "sy",
} as const satisfies Record<ResourceType, string>;

export function resourceToHex(resource: Omit<Resource, "resourceId">): Hex {
  const typeId = resourceTypeIds[resource.type];
  // Because namespaces are tied to access control, it's not safe to automatically truncate. Instead, we'll throw an error.
  if (resource.namespace.length > 14) {
    throw new Error(`Namespaces must fit into \`bytes14\`, but "${resource.namespace}" is too long.`);
  }
  return concatHex([
    stringToHex(typeId, { size: 2 }),
    stringToHex(resource.namespace, { size: 14 }),
    stringToHex(resource.name.slice(0, 16), { size: 16 }),
  ]);
}
