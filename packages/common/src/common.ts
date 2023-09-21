import { ResourceType } from "./resourceTypes";

export type ResourceId = {
  namespace: string;
  name: string;
  type: ResourceType;
};
