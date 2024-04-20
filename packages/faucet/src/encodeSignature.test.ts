import { mnemonicToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { signDripMessage } from "./signDripMessage";
import { createClient, http } from "viem";
import { encodeSignature } from "./encodeSignature";
import { decodeSignature } from "./decodeSignature";
import { encodedSignatureLength } from "./common";

describe("encodeSignature", () => {
  const account = mnemonicToAccount("test test test test test test test test test test test junk");
  const username = "@user";
  const client = createClient({ transport: http("http://127.0.0.1:8545") });
  const postContentPrefix = "prefix";

  it("should encode a signature as emojis", async () => {
    const signature = await signDripMessage({ client, account, username, postContentPrefix });
    const encodedSignature = encodeSignature(signature);
    expect(decodeSignature(encodedSignature)).toBe(signature);
    expect(encodedSignature.length).toBe(encodedSignatureLength);

    const signature2 = await signDripMessage({
      client,
      account,
      username,
      postContentPrefix: "a different and longer prefix",
    });
    expect(encodeSignature(signature2).length).toBe(encodedSignatureLength);
  });
});
