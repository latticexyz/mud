import { Hex } from "viem";
import { ResourceType } from "./resourceTypes";

export type Resource = {
  readonly resourceId: Hex;
  readonly type: ResourceType;
  readonly namespace: string;
  readonly name: string;
};
