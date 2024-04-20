import { Hex } from "viem";
import { encodeSignature } from "./encodeSignature";

export type GetPostContentParams = {
  postContentPrefix: string;
  signature: Hex;
};

export function getPostContent({ signature, postContentPrefix }: GetPostContentParams): string {
  return `${postContentPrefix} ${encodeSignature(signature)}`;
}
