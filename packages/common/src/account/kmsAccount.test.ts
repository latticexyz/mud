import { describe, it, expect, beforeEach } from "vitest";
import { createKmsAccount } from "./kmsAccount";
import { KMSClient } from "@aws-sdk/client-kms";
import { LocalAccount, verifyMessage, verifyTypedData } from "viem";

describe("kmsAccount", () => {
  let account: LocalAccount;

  beforeEach(async () => {
    const keyId = "PLACEHOLDER";
    const kmsInstance = new KMSClient({
      region: "eu-west-2",
      credentials: {
        accessKeyId: "PLACEHOLDER",
        secretAccessKey: "PLACEHOLDER",
      },
    });

    account = await createKmsAccount(keyId, kmsInstance);
  });

  it("signMessage", async () => {
    const message = "hello world";
    const signature = await account.signMessage({ message });

    const valid = await verifyMessage({
      address: account.address,
      message,
      signature,
    });

    expect(valid).toBeTruthy();
  });

  it("signTypedData", async () => {
    // Test signTypedData

    const chainId = 1;
    const verifyingContract = "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5";
    const domain = { chainId, verifyingContract } as const;
    const types = {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    };
    const message = {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    };

    const signature = await account.signTypedData({
      domain,
      types,
      primaryType: "Mail",
      message,
    });

    const valid = await verifyTypedData({
      address: account.address,
      signature,
      domain,
      types,
      primaryType: "Mail",
      message,
    });

    expect(valid).toBeTruthy();
  });
});
