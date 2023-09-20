import { Hex, hexToString, sliceHex } from "viem";
import { ResourceId } from "./common";
import { ResourceType } from "./resourceTypes";
import { resourceTypeIds } from "./resourceIdToHex";
import { ReverseMap } from "./type-utils/common";

const resourceTypeIdToType = Object.fromEntries(
  Object.entries(resourceTypeIds).map(([key, value]) => [value, key])
) as ReverseMap<typeof resourceTypeIds>;

function getResourceType(resourceTypeId: string): ResourceType | undefined {
  if (Object.hasOwn(resourceTypeIdToType, resourceTypeId)) {
    return resourceTypeIdToType[resourceTypeId as keyof typeof resourceTypeIdToType];
  }
}

export function hexToResourceId(hex: Hex): ResourceId {
  const namespace = hexToString(sliceHex(hex, 0, 14)).replace(/\0+$/, "");
  const name = hexToString(sliceHex(hex, 14, 30)).replace(/\0+$/, "");
  const resourceTypeId = hexToString(sliceHex(hex, 30, 32)).replace(/\0+$/, "");
  const type = getResourceType(resourceTypeId);

  if (!type) {
    throw new Error(`Unknown resource type: ${resourceTypeId}`);
  }

  return { namespace, name, type };
}
