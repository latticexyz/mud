import { encodedSignatureLength } from "./common";
import { decodeSignature } from "./decodeSignature";
import { GetPostContentParams } from "./getPostContent";

export type ParsePostContentResult = GetPostContentParams;

export function parsePostContent(postContent: string): ParsePostContentResult {
  const encodedSignature = postContent.slice(-encodedSignatureLength);
  const signature = decodeSignature(encodedSignature);
  const postContentPrefix = postContent.slice(0, postContent.length - encodedSignatureLength - 1);
  return { signature, postContentPrefix };
}
