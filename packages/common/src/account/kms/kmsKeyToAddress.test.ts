import { describe, it, expect, beforeAll } from "vitest";
import { KmsAccount, kmsKeyToAccount } from "./kmsKeyToAddress";
import { CreateKeyCommand, KMSClient } from "@aws-sdk/client-kms";
import { parseGwei, createWalletClient, http, parseEther, verifyMessage, verifyTypedData } from "viem";
import { foundry } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { anvilRpcUrl } from "../../../test/common";
import { waitForTransaction } from "../../test/waitForTransaction";
import { getBalance, waitForTransactionReceipt } from "viem/actions";

describe("kmsKeyToAccount", () => {
  let account: KmsAccount;
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

    account = await kmsKeyToAccount({ keyId, client });
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

  it("signTransaction", async () => {
    await account.signTransaction({
      chainId: 1,
      maxFeePerGas: parseGwei("20"),
      maxPriorityFeePerGas: parseGwei("3"),
      gas: 21000n,
      nonce: 69,
      to: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    });
  });

  it("signTypedData", async () => {
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

  it("can execute transactions", async () => {
    const adminClient = createWalletClient({
      chain: foundry,
      transport: http(anvilRpcUrl),
      account: privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"),
    });

    const kmsClient = createWalletClient({
      chain: foundry,
      transport: http(anvilRpcUrl),
      account,
    });

    // Fund the KMS account from the admin
    let balance = await getBalance(adminClient, { address: account.address });
    expect(balance).toEqual(0n);

    let tx = await adminClient.sendTransaction({ to: account.address, value: parseEther("1") });
    await waitForTransaction(tx);

    balance = await getBalance(adminClient, { address: account.address });
    expect(balance).toEqual(1000000000000000000n);

    // Check that the KMS account can execute transactions
    tx = await kmsClient.sendTransaction({});
    await waitForTransaction(tx);

    const receipt = await waitForTransactionReceipt(adminClient, { hash: tx });
    expect(receipt.status).toEqual("success");
  });
});
