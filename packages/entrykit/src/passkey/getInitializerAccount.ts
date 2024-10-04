import { LocalAccount, keccak256, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { P256Credential } from "webauthn-p256";

export function getInitializerAccount(
  credentialId: P256Credential["id"],
  publicKey: P256Credential["publicKey"],
): LocalAccount {
  return privateKeyToAccount(keccak256(stringToHex(`${credentialId}:${publicKey}`)));
}
