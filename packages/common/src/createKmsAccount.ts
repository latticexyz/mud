import { KMSClient } from "@aws-sdk/client-kms";
import { LocalAccount, hashMessage, hashTypedData, keccak256, serializeTransaction } from "viem";
import { toAccount } from "viem/accounts";
import { signWithKms } from "./account/kms/signWithKms";
import { getAddressFromKMS } from "./account/kms/getAddressFromKms";

export type CreateKmsAccountOptions = {
  keyId: string;
  client?: KMSClient;
};

export type KMSAccount = LocalAccount<"aws-kms">;

/**
 * @description Creates an Account from a KMS key and instance.
 *
 * @returns A Local Account.
 */
export async function createKmsAccount({
  keyId,
  client = new KMSClient(),
}: CreateKmsAccountOptions): Promise<KMSAccount> {
  const address = await getAddressFromKMS({ keyId, client });

  const account = toAccount({
    address,
    async signMessage({ message }) {
      const hash = hashMessage(message);
      const signature = await signWithKms({
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
      const signature = await signWithKms({
        client,
        keyId,
        hash,
        address,
      });

      return signature;
    },
    async signTypedData(typedData) {
      const hash = hashTypedData(typedData);
      const signature = await signWithKms({
        client,
        keyId,
        hash,
        address,
      });

      return signature;
    },
  });

  return {
    ...account,
    source: "aws-kms",
  };
}
