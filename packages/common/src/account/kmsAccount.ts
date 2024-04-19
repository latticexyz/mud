import { KMSClient } from "@aws-sdk/client-kms";
import { LocalAccount, hashMessage, hashTypedData, keccak256, serializeTransaction } from "viem";
import { toAccount } from "viem/accounts";
import { getEthAddressFromKMS } from "./kms";
import { sign } from "./sign";

export async function createKmsAccount(keyId: string, kmsInstance: KMSClient): Promise<LocalAccount> {
  const address = await getEthAddressFromKMS({ kmsInstance, keyId });

  const account = toAccount({
    address,
    async signMessage({ message }) {
      const hash = hashMessage(message);
      const signature = await sign({
        kmsInstance,
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
        kmsInstance,
        keyId,
        hash,
        address,
      });

      return signature;
    },
    async signTypedData(typedData) {
      const hash = hashTypedData(typedData);
      const signature = await sign({
        kmsInstance,
        keyId,
        hash,
        address,
      });

      return signature;
    },
  });

  return account;
}
