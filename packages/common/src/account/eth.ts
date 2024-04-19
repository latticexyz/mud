// @ts-expect-error
import asn1 from "asn1.js";
import { utils } from "ethers";
import { sign } from "./kms";
import { SignParams } from "./types";
import { Address, Hex, Signature, hexToSignature, isAddressEqual, toHex } from "viem";

type CreateSignatureParams = SignParams & {
  address: Hex;
};

const EcdsaSigAsnParse = asn1.define("EcdsaSig", function (this: any) {
  this.seq().obj(this.key("r").int(), this.key("s").int());
});

const EcdsaPubKey = asn1.define("EcdsaPubKey", function (this: any) {
  this.seq().obj(this.key("algo").seq().obj(this.key("a").objid(), this.key("b").objid()), this.key("pubKey").bitstr());
});

const getRS = async (signParams: SignParams): Promise<{ r: Hex; s: Hex }> => {
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
};

const getRecoveryParam = (msg: string, r: string, s: string, expectedEthAddr: Hex): number => {
  const formatted = msg;
  let recoveryParam: number;
  for (recoveryParam = 0; recoveryParam <= 1; recoveryParam++) {
    const address = utils.recoverAddress(formatted, {
      r,
      s,
      recoveryParam,
    }) as Hex;
    if (!isAddressEqual(address, expectedEthAddr)) {
      continue;
    }
    return recoveryParam;
  }
  throw new Error("Failed to calculate recovery param");
};

export const getEthAddressFromPublicKey = (publicKey: Uint8Array): Address => {
  const res = EcdsaPubKey.decode(Buffer.from(publicKey));

  const pubKeyBuffer: Buffer = res.pubKey.data;

  const address = utils.computeAddress(pubKeyBuffer) as Address;
  return address;
};

export const createSignature = async ({
  keyId,
  message,
  address,
  kmsInstance,
}: CreateSignatureParams): Promise<Signature> => {
  const { r, s } = await getRS({ keyId, message, kmsInstance });
  const recoveryParam = getRecoveryParam(message, r, s, address);

  // REMOVE THIS
  const ethersSignature = utils.joinSignature({
    r: r,
    s: s,
    v: recoveryParam,
  }) as Hex;

  return hexToSignature(ethersSignature);
};
