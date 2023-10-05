import { Hex } from "viem";
import { ResourceType } from "./resourceTypes";

export type Resource = {
  namespace: string;
  name: string;
  type: ResourceType;
  hex: Hex;
};
