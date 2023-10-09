import { Hex } from "viem";
import { ResourceType } from "./resourceTypes";

export type Resource = {
  resourceId: Hex;
  type: ResourceType;
  namespace: string;
  name: string;
};
