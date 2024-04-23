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

type GetPublicKeyParams = {
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
};

type GetEthAddressFromKMSparams = {
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
};

type SignParams = {
  hash: Hex;
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
};

const getPublicKey = (getPublicKeyParams: GetPublicKeyParams): Promise<GetPublicKeyCommandOutput> => {
  const { keyId, client } = getPublicKeyParams;
  const command = new GetPublicKeyCommand({ KeyId: keyId });

  return client.send(command);
};

export const getEthAddressFromKMS = async (
  getEthAddressFromKMSparams: GetEthAddressFromKMSparams,
): Promise<Address> => {
  const { keyId, client } = getEthAddressFromKMSparams;
  const KMSKey = await getPublicKey({ keyId, client });

  return getEthAddressFromPublicKey(KMSKey.PublicKey as Uint8Array);
};

export const signWithKMS = async ({ keyId, hash, client }: SignParams): Promise<SignCommandOutput> => {
  const formatted = Buffer.from(fromHex(hash, "bytes"));

  const command = new SignCommand({
    KeyId: keyId,
    Message: formatted,
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST",
  });

  return client.send(command);
};
