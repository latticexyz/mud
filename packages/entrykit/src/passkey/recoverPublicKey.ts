import { sign } from "webauthn-p256";
import { getMessageHash } from "./getMessageHash";
import { getCandidatePublicKeys } from "./getCandidatePublicKeys";
import { SignatureAndMessage } from "./common";
import { hashMessage, Hex } from "viem";
import { P256Credential } from "viem/account-abstraction";

export function findPublicKey([input1, input2]: [SignatureAndMessage, SignatureAndMessage]): Hex | undefined {
  // Return the candidate public key that appears twice
  return firstDuplicate([...getCandidatePublicKeys(input1), ...getCandidatePublicKeys(input2)]);
}

export async function recoverPublicKey(input: { credentialId: P256Credential["id"] } & SignatureAndMessage) {
  const message2 = hashMessage(input.signatureHex);
  const {
    signature: signature2,
    webauthn: webauthn2,
    raw: credential,
  } = await sign({ credentialId: input.credentialId, hash: message2 });
  const messageHash2 = await getMessageHash(webauthn2);

  const publicKey = findPublicKey([input, { signatureHex: signature2, messageHash: messageHash2 }]);
  if (publicKey) {
    return { publicKey, credential };
  }
}

function firstDuplicate<T>(arr: T[]): T | undefined {
  const seen = new Set<T>();
  for (const s of arr) {
    if (seen.has(s)) {
      return s;
    }
    seen.add(s);
  }
  return undefined;
}
