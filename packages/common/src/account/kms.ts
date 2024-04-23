import {
  GetPublicKeyCommand,
  GetPublicKeyCommandOutput,
  KMSClient,
  SignCommand,
  SignCommandInput,
  SignCommandOutput,
} from "@aws-sdk/client-kms";
import { Address, Hex, fromHex } from "viem";
import { getEthAddressFromPublicKey } from "./sign";

const getPublicKey = ({
  keyId,
  client,
}: {
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
}): Promise<GetPublicKeyCommandOutput> => {
  const command = new GetPublicKeyCommand({ KeyId: keyId });

  return client.send(command);
};

export const getEthAddressFromKMS = async ({
  keyId,
  client,
}: {
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
}): Promise<Address> => {
  const KMSKey = await getPublicKey({ keyId, client });

  return getEthAddressFromPublicKey(KMSKey.PublicKey as Uint8Array);
};

export const signWithKMS = async ({
  keyId,
  hash,
  client,
}: {
  hash: Hex;
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
}): Promise<SignCommandOutput> => {
  const formatted = Buffer.from(fromHex(hash, "bytes"));

  const command = new SignCommand({
    KeyId: keyId,
    Message: formatted,
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST",
  });

  return client.send(command);
};
