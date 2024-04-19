import { utils } from "ethers";
import { KMSClient } from "@aws-sdk/client-kms";
import { getEthAddressFromKMS } from "./kms";
import { Hex, hashMessage, hexToSignature, recoverMessageAddress, signatureToHex, verifyMessage } from "viem";
import { createSignature } from "./eth";

const keyId = "PLACEHOLDER";

const kmsInstance = new KMSClient({
  region: "eu-west-2",
  credentials: {
    accessKeyId: "PLACEHOLDER",
    secretAccessKey: "PLACEHOLDER",
  },
});

async function signMessage(message: string): Promise<Hex> {
  const hash = hashMessage(message);

  const address = await getEthAddressFromKMS({ kmsInstance, keyId });

  const ethersStructuredSignature = await createSignature({
    kmsInstance: kmsInstance,
    keyId: keyId,
    message: hash,
    address,
  });

  const ethersHexSignature = utils.joinSignature(ethersStructuredSignature) as Hex;

  const structuredSignature = hexToSignature(ethersHexSignature);

  return signatureToHex(structuredSignature);
}

const message = "hello";

const signature = await signMessage(message);

const recoveredAddress = await recoverMessageAddress({
  message,
  signature,
});

const valid = await verifyMessage({
  address: recoveredAddress,
  message,
  signature,
});

console.log(signature);
console.log(recoveredAddress);
console.log(valid);
