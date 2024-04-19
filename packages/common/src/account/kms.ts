import { GetPublicKeyCommand, GetPublicKeyCommandOutput, SignCommand, SignCommandOutput } from "@aws-sdk/client-kms";
import { SignParams, GetEthAddressFromKMSparams, GetPublicKeyParams } from "./types";
import { getEthAddressFromPublicKey } from "./eth";
import { utils } from "ethers";
import { Address } from "viem";

export const getPublicKey = (getPublicKeyParams: GetPublicKeyParams): Promise<GetPublicKeyCommandOutput> => {
  const { keyId, kmsInstance } = getPublicKeyParams;
  const command = new GetPublicKeyCommand({ KeyId: keyId });

  return kmsInstance.send(command);
};

export const getEthAddressFromKMS = async (
  getEthAddressFromKMSparams: GetEthAddressFromKMSparams,
): Promise<Address> => {
  const { keyId, kmsInstance } = getEthAddressFromKMSparams;
  const KMSKey = await getPublicKey({ keyId, kmsInstance });

  return getEthAddressFromPublicKey(KMSKey.PublicKey as Uint8Array) as Address;
};

export const sign = async (signParams: SignParams): Promise<SignCommandOutput> => {
  const { keyId, message, kmsInstance } = signParams;
  const formatted = Buffer.from(utils.arrayify(message));

  const command = new SignCommand({
    KeyId: keyId,
    Message: formatted,
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST",
  });

  return kmsInstance.send(command);
};
