import {
  GetPublicKeyCommand,
  GetPublicKeyCommandOutput,
  KMSClient,
  SignCommand,
  SignCommandInput,
  SignCommandOutput,
} from "@aws-sdk/client-kms";
import { utils } from "ethers";
import { Address } from "viem";
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
  hash: string;
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

export const signWithKMS = async ({ keyId, hash, kmsInstance }: SignParams): Promise<SignCommandOutput> => {
  const formatted = Buffer.from(utils.arrayify(hash));

  const command = new SignCommand({
    KeyId: keyId,
    Message: formatted,
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST",
  });

  return kmsInstance.send(command);
};
