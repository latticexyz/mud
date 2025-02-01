import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { KmsAccount, kmsKeyToAccount } from "./kmsKeyToAccount";
import { CreateKeyCommand, KMSClient } from "@aws-sdk/client-kms";
import { parseGwei, http, verifyMessage, verifyTypedData, createClient, parseEther } from "viem";
import { foundry } from "viem/chains";
import { getAnvilRpcUrl, getTestClient, snapshotAnvilState } from "../../../../../test-setup/common";
import { waitForTransaction } from "../../test/waitForTransaction";
import { getTransactionReceipt, sendTransaction } from "viem/actions";

describe.skipIf(!process.env.AWS_ENDPOINT_URL)("kmsKeyToAccount", () => {
  let account: KmsAccount;
  let keyId: string;

  beforeAll(snapshotAnvilState);
  beforeEach(snapshotAnvilState);

  beforeAll(async () => {
    const client = new KMSClient({
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
    // Fund the KMS account
    getTestClient().setBalance({ address: account.address, value: parseEther("1") });

    const kmsClient = createClient({
      chain: foundry,
      transport: http(getAnvilRpcUrl()),
      account,
    });

    // Check that the KMS account can execute transactions
    const tx = await sendTransaction(kmsClient, {});
    await waitForTransaction(tx);

    const receipt = await getTransactionReceipt(kmsClient, { hash: tx });
    expect(receipt.status).toEqual("success");
  });
});
