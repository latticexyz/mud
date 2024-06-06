import { Hex } from "viem";
import { ResourceType } from "./resourceTypes";

export type Resource = {
  readonly resourceId: Hex;
  readonly type: ResourceType;
  readonly namespace: string;
  readonly name: string;
};

export const ROOT_NAMESPACE = "";

export const NAME_MAX_LENGTH = 16;
export const NAMESPACE_MAX_LENGTH = 14;
