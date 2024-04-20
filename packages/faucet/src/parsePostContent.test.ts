import { createClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { signDripMessage } from "./signDripMessage";
import { getPostContent } from "./getPostContent";
import { parsePostContent } from "./parsePostContent";

describe("parsePostContent", () => {
  const account = mnemonicToAccount("test test test test test test test test test test test junk");
  const username = "@user";
  const client = createClient({ transport: http("http://127.0.0.1:8545") });
  const postContentPrefix = "prefix";

  it("should parse the post content into prefix and signature", async () => {
    const signature = await signDripMessage({ client, account, username, postContentPrefix });
    const postContent = getPostContent({ signature, postContentPrefix });
    expect(parsePostContent(postContent)).toEqual({ signature, postContentPrefix });
  });
});
