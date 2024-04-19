import { KMSClient, SignCommandInput } from "@aws-sdk/client-kms";
import { Hex } from "viem";

export type SignParams = {
  keyId: SignCommandInput["KeyId"];
  message: string;
  kmsInstance: KMSClient;
};

export type GetEthAddressFromKMSparams = {
  keyId: SignCommandInput["KeyId"];
  kmsInstance: KMSClient;
};

export type GetPublicKeyParams = {
  keyId: SignCommandInput["KeyId"];
  kmsInstance: KMSClient;
};

export type CreateSignatureParams = SignParams & {
  address: Hex;
};
