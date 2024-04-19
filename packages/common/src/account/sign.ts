// @ts-expect-error types
import asn1 from "asn1.js";
import { utils } from "ethers";
import { signWithKMS } from "./kms";
import { Address, Hex, isAddressEqual, signatureToHex, toHex } from "viem";
import { KMSClient, SignCommandInput } from "@aws-sdk/client-kms";
import { publicKeyToAddress } from "viem/utils";
import { computePublicKey } from "ethers/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EcdsaSigAsnParse = asn1.define("EcdsaSig", function (this: any) {
  this.seq().obj(this.key("r").int(), this.key("s").int());
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EcdsaPubKey = asn1.define("EcdsaPubKey", function (this: any) {
  this.seq().obj(this.key("algo").seq().obj(this.key("a").objid(), this.key("b").objid()), this.key("pubKey").bitstr());
});

const getRS = async (signParams: {
  hash: string;
  keyId: SignCommandInput["KeyId"];
  kmsInstance: KMSClient;
}): Promise<{ r: Hex; s: Hex }> => {
  const signature = await signWithKMS(signParams);

  if (signature.Signature === undefined) {
    throw new Error("Signature is undefined.");
  }

  const decoded = EcdsaSigAsnParse.decode(Buffer.from(signature.Signature), "der");

  const r = BigInt(decoded.r);
  let s = BigInt(decoded.s);

  const secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
  const secp256k1halfN = secp256k1N / 2n;

  if (s > secp256k1halfN) {
    s = secp256k1N - s;
  }

  return {
    r: toHex(r),
    s: toHex(s),
  };
};

const getRecoveryParam = (message: string, r: Hex, s: Hex, expectedEthAddr: Hex): number => {
  let recoveryParam: number;
  for (recoveryParam = 0; recoveryParam <= 1; recoveryParam++) {
    const address = utils.recoverAddress(message, {
      r,
      s,
      recoveryParam,
    }) as Hex;

    if (isAddressEqual(address, expectedEthAddr)) {
      return recoveryParam;
    }
  }
  throw new Error("Failed to calculate recovery param");
};

export const getEthAddressFromPublicKey = (publicKey: Uint8Array): Address => {
  const res = EcdsaPubKey.decode(Buffer.from(publicKey));

  const publicKeyBuffer: Buffer = res.pubKey.data;

  const publicKeyString = computePublicKey(publicKeyBuffer);
  const address = publicKeyToAddress(publicKeyString as Hex);

  return address;
};

type SignParameters = {
  hash: string;
  keyId: SignCommandInput["KeyId"];
  kmsInstance: KMSClient;
  address: Hex;
};

type SignReturnType = Hex;

/**
 * @description Signs a hash with a given KMS key.
 *
 * @param hash The hash to sign.
 *
 * @returns The signature.
 */
export const sign = async ({ hash, address, keyId, kmsInstance }: SignParameters): Promise<SignReturnType> => {
  const { r, s } = await getRS({ keyId, hash, kmsInstance });
  const recovery = getRecoveryParam(hash, r, s, address);

  return signatureToHex({
    r,
    s,
    v: recovery ? 28n : 27n,
    yParity: recovery,
  });
};
