import { beforeAll, describe, expect, it } from "vitest";
import { createPublicClient, createWalletClient, http, parseEther, verifyMessage } from "viem";
import { foundry } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { CreateKeyCommand, KMSClient } from "@aws-sdk/client-kms";
import { anvilRpcUrl } from "../test/common";
import { waitForTransaction } from "./test/waitForTransaction";
import { KMSAccount, createKmsAccount } from "./createKmsAccount";

describe("createKmsAccount tsransaction", async () => {
  let account: KMSAccount;
  let keyId: string;

  beforeAll(async () => {
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

    let balance = await publicClient.getBalance({ address: account.address });
    expect(balance).toEqual(0n);

    const kmsClient = createWalletClient({
      chain: foundry,
      transport: http(anvilRpcUrl),
      account,
    });

    const adminClient = createWalletClient({
      chain: foundry,
      transport: http(anvilRpcUrl),
      account: privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
    });

    let tx = await adminClient.sendTransaction({ to: account.address, value: parseEther("1") });
    await waitForTransaction(tx);

    balance = await publicClient.getBalance({ address: account.address });
    expect(balance).toEqual(1000000000000000000n);

    tx = await kmsClient.sendTransaction({});
    await waitForTransaction(tx);

    balance = await publicClient.getBalance({ address: account.address });
    expect(balance).toBeLessThan(1000000000000000000n);
  });
});
