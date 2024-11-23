import { Hex, Signature, isAddressEqual, signatureToHex, toHex } from "viem";
import { recoverAddress } from "viem/utils";
import { KMSClient, SignCommandInput } from "@aws-sdk/client-kms";
import { sign } from "./sign";
// @ts-expect-error Could not find a declaration file for module 'asn1.js'.
import asn1 from "asn1.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EcdsaSigAsnParse = asn1.define("EcdsaSig", function (this: any) {
  this.seq().obj(this.key("r").int(), this.key("s").int());
});

async function getRS(signParams: {
  hash: Hex;
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
}): Promise<{ r: Hex; s: Hex }> {
  const signature = await sign(signParams);

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
}

async function getRecovery(hash: Hex, r: Hex, s: Hex, expectedAddress: Hex): Promise<number> {
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
}

type SignParameters = {
  hash: Hex;
  keyId: SignCommandInput["KeyId"];
  client: KMSClient;
  address: Hex;
};

type SignReturnType = Signature;

/**
 * @description Signs a hash with a given KMS key.
 *
 * @param hash The hash to sign.
 *
 * @returns The signature.
 */
export async function signWithKms({ hash, address, keyId, client }: SignParameters): Promise<SignReturnType> {
  const { r, s } = await getRS({ keyId, hash, client });
  const recovery = await getRecovery(hash, r, s, address);

  return {
    r,
    s,
    v: recovery ? 28n : 27n,
    yParity: recovery,
  };
}
