import {
  GetPublicKeyCommand,
  GetPublicKeyCommandOutput,
  KMSClient,
  SignCommand,
  SignCommandInput,
  SignCommandOutput,
} from "@aws-sdk/client-kms";
import { Address, Hex } from "viem";
import { getEthAddressFromPublicKey } from "./sign";

type GetPublicKeyParams = {
  keyId: SignCommandInput["KeyId"];
  kmsInstance: KMSClient;
};

type GetEthAddressFromKMSparams = {
  keyId: SignCommandInput["KeyId"];
  kmsInstance: KMSClient;
};

type SignParams = {
  hash: Hex;
  keyId: SignCommandInput["KeyId"];
  kmsInstance: KMSClient;
};

const getPublicKey = (getPublicKeyParams: GetPublicKeyParams): Promise<GetPublicKeyCommandOutput> => {
  const { keyId, kmsInstance } = getPublicKeyParams;
  const command = new GetPublicKeyCommand({ KeyId: keyId });

  return kmsInstance.send(command);
};

export const getEthAddressFromKMS = async (
  getEthAddressFromKMSparams: GetEthAddressFromKMSparams,
): Promise<Address> => {
  const { keyId, kmsInstance } = getEthAddressFromKMSparams;
  const KMSKey = await getPublicKey({ keyId, kmsInstance });

  return getEthAddressFromPublicKey(KMSKey.PublicKey as Uint8Array);
};

function arrayify(value: Hex): Uint8Array {
  const hex = value.substring(2);

  const result = [];
  for (let i = 0; i < hex.length; i += 2) {
    result.push(parseInt(hex.substring(i, i + 2), 16));
  }

  return new Uint8Array(result);
}

export const signWithKMS = async ({ keyId, hash, kmsInstance }: SignParams): Promise<SignCommandOutput> => {
  const formatted = Buffer.from(arrayify(hash));

  const command = new SignCommand({
    KeyId: keyId,
    Message: formatted,
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST",
  });

  return kmsInstance.send(command);
};
