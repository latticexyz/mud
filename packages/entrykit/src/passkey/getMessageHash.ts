import { bytesToHex, Hex, hexToBytes, WebAuthnData } from "webauthn-p256";
import { concatBytes, utf8ToBytes } from "@noble/curves/abstract/utils";

// lifted out of https://github.com/wevm/webauthn-p256/blob/main/src/verify.ts
// TODO: submit a PR to lift this out as a function that can be exported

export async function getMessageHash(
  webauthn: Omit<WebAuthnData, "typeIndex" | "challengeIndex"> & {
    challengeIndex?: number;
    typeIndex?: number;
  },
): Promise<Hex | never> {
  const {
    authenticatorData,
    challengeIndex: challengeIndexRaw,
    clientDataJSON,
    typeIndex: typeIndexRaw,
    userVerificationRequired,
  } = webauthn;

  const typeIndex = typeIndexRaw || clientDataJSON.indexOf('"type"');
  const challengeIndex = challengeIndexRaw || clientDataJSON.indexOf('"challenge"');

  const authenticatorDataBytes = hexToBytes(authenticatorData);

  // Check length of `authenticatorData`.
  if (authenticatorDataBytes.length < 37) throw new Error("Invalid authenticatorData");

  const flag = authenticatorDataBytes[32]!;

  // Verify that the UP bit of the flags in authData is set.
  if ((flag & 0x01) !== 0x01) throw new Error("Invalid authenticatorData");

  // If user verification was determined to be required, verify that
  // the UV bit of the flags in authData is set. Otherwise, ignore the
  // value of the UV flag.
  if (userVerificationRequired && (flag & 0x04) !== 0x04) throw new Error("Invalid authenticatorData");

  // If the BE bit of the flags in authData is not set, verify that
  // the BS bit is not set.
  if ((flag & 0x08) !== 0x08 && (flag & 0x10) === 0x10) throw new Error("Invalid authenticatorData");

  // Check that response is for an authentication assertion
  const type = '"type":"webauthn.get"';
  if (type !== clientDataJSON.slice(Number(typeIndex), type.length + 1)) throw new Error("Invalid clientDataJSON");

  // Check that hash is in the clientDataJSON.
  const match = clientDataJSON.slice(Number(challengeIndex)).match(/^"challenge":"(.*?)"/);
  if (!match) throw new Error("Invalid clientDataJSON");

  const clientDataJSONHash = new Uint8Array(await crypto.subtle.digest("SHA-256", utf8ToBytes(clientDataJSON)));
  const messageHash = new Uint8Array(
    await crypto.subtle.digest("SHA-256", concatBytes(hexToBytes(authenticatorData), clientDataJSONHash)),
  );

  return bytesToHex(messageHash);
}
