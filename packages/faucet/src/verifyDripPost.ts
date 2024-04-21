import { TwitterApiReadOnly } from "twitter-api-v2";
import { error } from "./debug";
import { Address } from "viem";
import debug from "debug";
import { parsePostContent } from "./parsePostContent";
import { verifyDripMessage } from "./verifyDripMessage";

export type VerifyXPostParams = {
  xApi: TwitterApiReadOnly;
  username: string;
  address: Address;
  postContentPrefix: string;
};

export async function verifyDripPost({
  xApi,
  username,
  address,
  postContentPrefix,
}: VerifyXPostParams): Promise<boolean> {
  // return true;
  try {
    const user = await xApi.v2.userByUsername(username);
    // 5 is the minimum according to https://api.twitter.com/2/openapi.json
    const posts = await xApi.v2.userTimeline(user.data.id, { max_results: 5 });
    for (const post of posts) {
      const postContent = post.text;
      if (!postContent.startsWith(postContentPrefix)) {
        continue;
      }
      const { signature } = parsePostContent(postContent);
      if (await verifyDripMessage({ address, username, signature, postContentPrefix })) {
        return true;
      }
    }
    debug("No valid drip post found for " + username);
    return false;
  } catch (e) {
    error(e);
    return false;
  }
}
