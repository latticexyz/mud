import { parseSignature, serializePublicKey } from "webauthn-p256";
import { SignatureAndMessage } from "./common";
import { secp256r1 } from "@noble/curves/p256";

export function getCandidatePublicKeys(input: SignatureAndMessage) {
  const { r, s } = parseSignature(input.signatureHex);

  const candidate1 = new secp256r1.Signature(r, s).addRecoveryBit(1).recoverPublicKey(input.messageHash.slice(2));

  const candidate2 = new secp256r1.Signature(r, s).addRecoveryBit(0).recoverPublicKey(input.messageHash.slice(2));

  return [serializePublicKey(candidate1), serializePublicKey(candidate2)];
}
