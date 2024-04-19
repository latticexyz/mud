import { KMSClient, SignCommandInput } from "@aws-sdk/client-kms";

export type SignParams = {
  keyId: SignCommandInput["KeyId"];
  message: string;
  kmsInstance: KMSClient;
};
