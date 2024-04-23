import { KMSClient } from "@aws-sdk/client-kms";
import { LocalAccount, hashMessage, hashTypedData, keccak256, serializeTransaction } from "viem";
import { toAccount } from "viem/accounts";
import { getEthAddressFromKMS } from "./account/kms";
import { sign } from "./account/sign";

export type CreateKmsAccountOptions = {
  keyId: string;
  client?: KMSClient;
};

/**
 * @description Creates an Account from a KMS key and instance.
 *
 * @returns A Local Account.
 */
export async function createKmsAccount({
  keyId,
  client = new KMSClient(),
}: CreateKmsAccountOptions): Promise<LocalAccount> {
  const address = await getEthAddressFromKMS({ client, keyId });

  const account = toAccount({
    address,
    async signMessage({ message }) {
      const hash = hashMessage(message);
      const signature = await sign({
        client,
        keyId,
        hash,
        address,
      });

      return signature;
    },
    async signTransaction(transaction) {
      const unsignedTx = serializeTransaction(transaction);
      const hash = keccak256(unsignedTx);
      const signature = await sign({
        client,
        keyId,
        hash,
        address,
      });

      return signature;
    },
    async signTypedData(typedData) {
      const hash = hashTypedData(typedData);
      const signature = await sign({
        client,
        keyId,
        hash,
        address,
      });

      return signature;
    },
  });

  return account;
}
