import { Hex, hexToString, sliceHex } from "viem";
import { ResourceId } from "./common";
import { ResourceType, resourceTypes } from "./resourceTypes";
import { resourceTypeIds } from "./resourceIdToHex";
import { ReverseMap } from "./type-utils/common";

const resourceTypeIdToType = Object.fromEntries(
  Object.entries(resourceTypeIds).map(([key, value]) => [value, key])
) as ReverseMap<typeof resourceTypeIds>;

function getResourceType(resourceTypeId: string): ResourceType | undefined {
  // TODO: replace Partial with `noUncheckedIndexedAccess`
  const type = (resourceTypeIdToType as Partial<Record<string, ResourceType>>)[resourceTypeId];
  if (resourceTypes.includes(type as ResourceType)) {
    return type;
  }
}

export function hexToResourceId(hex: Hex): ResourceId {
  const resourceTypeId = hexToString(sliceHex(hex, 0, 2)).replace(/\0+$/, "");
  const type = getResourceType(resourceTypeId);
  const namespace = hexToString(sliceHex(hex, 2, 16)).replace(/\0+$/, "");
  const name = hexToString(sliceHex(hex, 16, 32)).replace(/\0+$/, "");

  if (!type) {
    throw new Error(`Unknown resource type: ${resourceTypeId}`);
  }

  return { type, namespace, name };
}
