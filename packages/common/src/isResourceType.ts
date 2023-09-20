import { ResourceType, resourceTypes } from "./common";

export function isResourceType(type: unknown): type is ResourceType {
  return Object.values(resourceTypes).includes(type as ResourceType);
}
