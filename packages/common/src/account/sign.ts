// @ts-expect-error types
import asn1 from "asn1.js";
import { Address, Hex, isAddressEqual, signatureToHex, toHex } from "viem";
import { KMSClient, SignCommandInput } from "@aws-sdk/client-kms";
import { publicKeyToAddress, recoverAddress } from "viem/utils";
import { computePublicKey } from "@ethersproject/signing-key";
import { signWithKMS } from "./kms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EcdsaSigAsnParse = asn1.define("EcdsaSig", function (this: any) {
  this.seq().obj(this.key("r").int(), this.key("s").int());
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EcdsaPubKey = asn1.define("EcdsaPubKey", function (this: any) {
  this.seq().obj(this.key("algo").seq().obj(this.key("a").objid(), this.key("b").objid()), this.key("pubKey").bitstr());
});

const getRS = async (signParams: {
  hash: Hex;
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

const getRecovery = async (hash: Hex, r: Hex, s: Hex, expectedAddress: Hex): Promise<number> => {
  let recovery: number;
  for (recovery = 0; recovery <= 1; recovery++) {
    const signature = signatureToHex({
      r,
      s,
      v: recovery ? 28n : 27n,
      yParity: recovery,
    });

    const address = await recoverAddress({ hash, signature });

    if (isAddressEqual(address, expectedAddress)) {
      return recovery;
    }
  }
  throw new Error("Failed to calculate recovery param");
};

export const getEthAddressFromPublicKey = (publicKey: Uint8Array): Address => {
  const res = EcdsaPubKey.decode(Buffer.from(publicKey));

  const publicKeyBuffer: Buffer = res.pubKey.data;

  const publicKeyHex = computePublicKey(publicKeyBuffer) as Hex;
  const address = publicKeyToAddress(publicKeyHex);

  return address;
};

type SignParameters = {
  hash: Hex;
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
  const recovery = await getRecovery(hash, r, s, address);

  return signatureToHex({
    r,
    s,
    v: recovery ? 28n : 27n,
    yParity: recovery,
  });
};
