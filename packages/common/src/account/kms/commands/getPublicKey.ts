import {
  GetPublicKeyCommand,
  GetPublicKeyCommandInput,
  GetPublicKeyCommandOutput,
  KMSClient,
} from "@aws-sdk/client-kms";

export const getPublicKey = ({
  keyId,
  client,
}: {
  keyId: GetPublicKeyCommandInput["KeyId"];
  client: KMSClient;
}): Promise<GetPublicKeyCommandOutput> => {
  const command = new GetPublicKeyCommand({ KeyId: keyId });

  return client.send(command);
};
