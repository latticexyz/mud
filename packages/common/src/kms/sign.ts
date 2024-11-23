import { KMSClient, SignCommand, SignCommandInput, SignCommandOutput } from "@aws-sdk/client-kms";
import { Hex, fromHex } from "viem";

export async function sign({
  keyId,
  hash,
  client,
}: {
  hash: Hex;
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
}): Promise<SignCommandOutput> {
  const formatted = Buffer.from(fromHex(hash, "bytes"));

  const command = new SignCommand({
    KeyId: keyId,
    Message: formatted,
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST",
  });

  return client.send(command);
}
