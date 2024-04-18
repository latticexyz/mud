import { utils } from "ethers";
import { KMSClient, SignCommand, SignCommandInput, SignCommandOutput } from "@aws-sdk/client-kms";
import { toAccount } from "viem/accounts";
import { keccak256, toHex } from "viem";

type SignParams = {
  keyId: SignCommandInput["KeyId"];
  message: string;
  kmsInstance: KMSClient;
};

const sign = async (signParams: SignParams): Promise<SignCommandOutput> => {
  const { keyId, message, kmsInstance } = signParams;
  const formatted = Buffer.from(utils.arrayify(message));

  const command = new SignCommand({
    KeyId: keyId,
    Message: formatted,
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST",
  });

  return kmsInstance.send(command);
};

const keyId = "PLACEHOLDER";

const kmsInstance = new KMSClient({
  region: "eu-west-2",
  credentials: {
    accessKeyId: "PLACEHOLDER",
    secretAccessKey: "PLACEHOLDER",
  },
});

const account = toAccount({
  address: "0x0000000000000000000000000000000000000000",
  async signMessage({ message }) {
    if (typeof message === "string") {
      const signature = await sign({ keyId, message: keccak256(toHex(message)), kmsInstance });

      if (signature.Signature == undefined) {
        throw new Error("Signature is undefined.");
      }

      return signature.Signature;
    }
  },
});

console.log(await account.signMessage({ message: "hello" }));
