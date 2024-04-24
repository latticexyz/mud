import { beforeAll, describe, expect, it } from "vitest";
import { createPublicClient, http, verifyMessage } from "viem";
import { CreateKeyCommand, KMSClient } from "@aws-sdk/client-kms";
import { foundry } from "viem/chains";
import { KMSAccount, createKmsAccount } from "@latticexyz/common";
import { deployMockGame } from "../../test/mockGame";
import { anvilRpcUrl } from "../../test/common";

describe("createKmsAccount", async () => {
  let account: KMSAccount;
  let keyId: string;

  beforeAll(async () => {
    await deployMockGame();

    const client = new KMSClient({
      endpoint: process.env.KMS_ENDPOINT,
      region: "local",
      credentials: {
        accessKeyId: "AKIAXTTRUF7NU7KDMIED",
        secretAccessKey: "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",
      },
    });

    const command = new CreateKeyCommand({
      KeyUsage: "SIGN_VERIFY",
      CustomerMasterKeySpec: "ECC_SECG_P256K1",
    });

    const createResponse = await client.send(command);

    if (!createResponse.KeyMetadata || !createResponse.KeyMetadata.KeyId) {
      throw new Error("key creation failed");
    }

    keyId = createResponse.KeyMetadata.KeyId;

    account = await createKmsAccount({ keyId, client });
  });

  it("can execute transactions", async () => {
    const message = "hello world";
    const signature = await account.signMessage({ message });

    const valid = await verifyMessage({
      address: account.address,
      message,
      signature,
    });

    expect(valid).toBeTruthy();

    const publicClient = createPublicClient({
      chain: foundry,
      transport: http(anvilRpcUrl),
    });

    const balance = await publicClient.getBalance({ address: account.address });
    expect(balance).toEqual(0n);
  });
});
