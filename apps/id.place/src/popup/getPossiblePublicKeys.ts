import { Base64, Bytes, Hash, Hex, P256, Signature, WebAuthnP256 } from "ox";

export function getPossiblePublicKeys({
  challenge,
  signature,
}: {
  challenge: Hex.Hex;
  signature: WebAuthnP256.sign.ReturnType;
}) {
  const payload = getPayloadHash({ challenge, metadata: signature.metadata });
  if (!payload) throw new Error("could not get payload hash");

  return [0, 1].map((yParity) =>
    P256.recoverPublicKey({
      payload,
      signature: Signature.from({ ...signature.signature, yParity }),
    }),
  );
}

// Lifted out of https://github.com/wevm/ox/blob/b8cfad0fba475a0df4fabed72d3b127cfa81ab44/src/core/WebAuthnP256.ts#L685
function getPayloadHash(options: Pick<WebAuthnP256.verify.Options, "challenge" | "metadata">) {
  const { challenge, metadata } = options;
  const { authenticatorData, challengeIndex, clientDataJSON, typeIndex, userVerificationRequired } = metadata;

  const authenticatorDataBytes = Bytes.fromHex(authenticatorData);

  // Check length of `authenticatorData`.
  if (authenticatorDataBytes.length < 37) return false;

  const flag = authenticatorDataBytes[32]!;

  // Verify that the UP bit of the flags in authData is set.
  if ((flag & 0x01) !== 0x01) return false;

  // If user verification was determined to be required, verify that
  // the UV bit of the flags in authData is set. Otherwise, ignore the
  // value of the UV flag.
  if (userVerificationRequired && (flag & 0x04) !== 0x04) return false;

  // If the BE bit of the flags in authData is not set, verify that
  // the BS bit is not set.
  if ((flag & 0x08) !== 0x08 && (flag & 0x10) === 0x10) return false;

  // Check that response is for an authentication assertion
  const type = '"type":"webauthn.get"';
  if (type !== clientDataJSON.slice(Number(typeIndex), type.length + 1)) return false;

  // Check that hash is in the clientDataJSON.
  const match = clientDataJSON.slice(Number(challengeIndex)).match(/^"challenge":"(.*?)"/);
  if (!match) return false;

  // Validate the challenge in the clientDataJSON.
  const [_, challenge_extracted] = match;
  if (Hex.fromBytes(Base64.toBytes(challenge_extracted!)) !== challenge) return false;

  const clientDataJSONHash = Hash.sha256(Bytes.fromString(clientDataJSON), {
    as: "Bytes",
  });
  const payload = Bytes.concat(authenticatorDataBytes, clientDataJSONHash);

  return Hash.sha256(payload);
}
