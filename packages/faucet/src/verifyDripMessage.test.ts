import { mnemonicToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { signDripMessage } from "./signDripMessage";
import { createClient, http } from "viem";
import { verifyDripMessage } from "./verifyDripMessage";

describe("verifyDripMessage", () => {
  const account = mnemonicToAccount("test test test test test test test test test test test junk");
  const account2 = mnemonicToAccount("test test test test test test test test test test test junk", {
    accountIndex: 2,
  });
  const username = "@user";
  const client = createClient({ transport: http("http://127.0.0.1:8545") });
  const signMessagePrefix = "prefix";

  it("should verify a message signed with `signDripMessage`", async () => {
    const signature = await signDripMessage({ client, account, username, signMessagePrefix });
    expect(await verifyDripMessage({ address: account.address, signature, username })).toBe(true);
    expect(await verifyDripMessage({ address: account.address, signature, username: "@bob" })).toBe(false);
    expect(await verifyDripMessage({ address: account2.address, signature, username })).toBe(false);
  });
});
