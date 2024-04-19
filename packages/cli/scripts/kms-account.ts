import { hashMessage, hashTypedData, signatureToHex, verifyMessage, verifyTypedData } from "viem";
import { toAccount } from "viem/accounts";
import { KMSClient } from "@aws-sdk/client-kms";
import { getEthAddressFromKMS } from "./kms";
import { createSignature } from "./eth";

const keyId = "PLACE";

const kmsInstance = new KMSClient({
  region: "eu-west-2",
  credentials: {
    accessKeyId: "PLACE",
    secretAccessKey: "PLACE",
  },
});

async function createAccount() {
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

const account = await createAccount();

// Test signMessage
{
  const message = "hello world";
  const signature = await account.signMessage({ message });

  const valid = await verifyMessage({
    address: account.address,
    message,
    signature,
  });

  console.log(valid);
}

// Test signTypedData
{
  const chainId = 1;
  const verifyingContract = "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5";
  const domain = { chainId, verifyingContract } as const;
  const types = {
    Person: [
      { name: "name", type: "string" },
      { name: "wallet", type: "address" },
    ],
    Mail: [
      { name: "from", type: "Person" },
      { name: "to", type: "Person" },
      { name: "contents", type: "string" },
    ],
  };
  const message = {
    from: {
      name: "Cow",
      wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
    },
    to: {
      name: "Bob",
      wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    },
    contents: "Hello, Bob!",
  };

  const signature = await account.signTypedData({
    domain,
    types,
    primaryType: "Mail",
    message,
  });

  const valid = await verifyTypedData({
    address: account.address,
    signature,
    domain,
    types,
    primaryType: "Mail",
    message,
  });

  console.log(valid);
}
