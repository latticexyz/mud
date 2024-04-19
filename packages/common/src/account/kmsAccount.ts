import { KMSClient } from "@aws-sdk/client-kms";
import { LocalAccount, hashMessage, hashTypedData, signatureToHex } from "viem";
import { toAccount } from "viem/accounts";
import { getEthAddressFromKMS } from "./kms";
import { createSignature } from "./eth";

export async function createKmsAccount(keyId: string, kmsInstance: KMSClient): Promise<LocalAccount> {
  const address = await getEthAddressFromKMS({ kmsInstance, keyId });

  const account = toAccount({
    address,
    async signMessage({ message }) {
      const hash = hashMessage(message);
      const signature = await createSignature({
        kmsInstance: kmsInstance,
        keyId: keyId,
        message: hash,
        address,
      });

      return signatureToHex(signature);
    },
    async signTransaction() {
      return "0x"; // TODO
    },
    async signTypedData(typedData) {
      const hash = hashTypedData(typedData);

      const address = await getEthAddressFromKMS({ kmsInstance, keyId });

      const signature = await createSignature({
        kmsInstance: kmsInstance,
        keyId: keyId,
        message: hash,
        address,
      });

      return signatureToHex(signature);
    },
  });

  return account;
}
