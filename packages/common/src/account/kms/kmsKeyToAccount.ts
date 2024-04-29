import { KMSClient } from "@aws-sdk/client-kms";
import { LocalAccount, hashMessage, hashTypedData, keccak256, serializeTransaction, signatureToHex } from "viem";
import { toAccount } from "viem/accounts";
import { signWithKms } from "./signWithKms";
import { getAddressFromKms } from "./getAddressFromKms";

export type KmsKeyToAccountOptions = {
  keyId: string;
  client?: KMSClient;
};

export type KmsAccount = LocalAccount<"aws-kms"> & {
  getKeyId(): string;
};

/**
 * @description Creates an Account from a KMS key.
 *
 * @returns A Local Account.
 */
export async function kmsKeyToAccount({
  keyId,
  client = new KMSClient(),
}: KmsKeyToAccountOptions): Promise<KmsAccount> {
  const address = await getAddressFromKms({ keyId, client });

  const account = toAccount({
    address,
    async signMessage({ message }) {
      const signature = await signWithKms({
        client,
        keyId,
        hash: hashMessage(message),
        address,
      });

      return signatureToHex(signature);
    },
    // The logic of this function should be align with viem's signTransaction
    // https://github.com/wevm/viem/blob/main/src/accounts/utils/signTransaction.ts
    async signTransaction(transaction, { serializer = serializeTransaction } = {}) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const signableTransaction = (() => {
        // For EIP-4844 Transactions, we want to sign the transaction payload body (tx_payload_body) without the sidecars (ie. without the network wrapper).
        // See: https://github.com/ethereum/EIPs/blob/e00f4daa66bd56e2dbd5f1d36d09fd613811a48b/EIPS/eip-4844.md#networking
        if (transaction.type === "eip4844")
          return {
            ...transaction,
            sidecars: false,
          };
        return transaction;
      })();

      const signature = await signWithKms({
        client,
        keyId,
        hash: keccak256(serializer(signableTransaction)),
        address,
      });

      return serializer(transaction, signature);
    },
    async signTypedData(typedData) {
      const signature = await signWithKms({
        client,
        keyId,
        hash: hashTypedData(typedData),
        address,
      });

      return signatureToHex(signature);
    },
  });

  return {
    ...account,
    source: "aws-kms",
    getKeyId: () => keyId,
  };
}
