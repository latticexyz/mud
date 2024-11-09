import { Hex } from "viem";
import { GetCredentialCreationOptionsParameters } from "webauthn-p256";

export type CredentialOptions = Pick<GetCredentialCreationOptionsParameters, "rp">;

export type SignatureAndMessage = {
  signatureHex: Hex;
  messageHash: Hex;
};
