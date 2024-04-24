import { describe, expect, it } from "vitest";
import { createAsyncErrorHandler } from "./asyncErrors";
import { rpcHttpUrl } from "./setup/constants";
import { createKmsAccount } from "@latticexyz/common";
import { CreateKeyCommand, KMSClient } from "@aws-sdk/client-kms";
import { createPublicClient, http } from "viem";
import { mudFoundry } from "@latticexyz/common/chains";

describe("KMS", async () => {
  const asyncErrorHandler = createAsyncErrorHandler();

  it("should sync test data", async () => {
    asyncErrorHandler.resetErrors();

    const kmsClient = new KMSClient({
      endpoint: process.env.KMS_ENDPOINT,
      region: "local",
      credentials: {
        accessKeyId: "AKIAXTTRUF7NU7KDMIED",
        secretAccessKey: "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",
      },
    });

    // Create a new KMS key
    const command = new CreateKeyCommand({
      KeyUsage: "SIGN_VERIFY",
      CustomerMasterKeySpec: "ECC_SECG_P256K1",
    });

    const createResponse = await kmsClient.send(command);

    if (!createResponse.KeyMetadata || !createResponse.KeyMetadata.KeyId) {
      throw new Error("key creation failed");
    }

    const keyId = createResponse.KeyMetadata.KeyId;

    // Declare a KMS Account
    const account = await createKmsAccount({
      keyId,
      client: kmsClient,
    });

    const publicClient = createPublicClient({
      chain: mudFoundry,
      transport: http(rpcHttpUrl),
    });

    // Check the balance of the KMS account
    const balance = await publicClient.getBalance({ address: account.address });

    expect(balance).toEqual(0);
  });
});
