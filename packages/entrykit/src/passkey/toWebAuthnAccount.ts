import { ErrorType } from "@ark/util";
import { hashMessage, hashTypedData } from "viem";
import { WebAuthnAccount } from "viem/account-abstraction";
import { type P256Credential } from "webauthn-p256";
import { createBridge } from "@latticexyz/id/internal";

export type ToWebAuthnAccountParameters = {
  /**
   * The WebAuthn P256 credential to use.
   */
  credential: {
    id: P256Credential["id"];
    publicKey: P256Credential["publicKey"];
  };
  bridgeUrl?: string;
};

export type ToWebAuthnAccountReturnType = WebAuthnAccount;

export type ToWebAuthnAccountErrorType = ErrorType;

/**
 * @description Creates an Account from a WebAuthn Credential.
 *
 * @returns A WebAuthn Account.
 */
export function toWebAuthnAccount(parameters: ToWebAuthnAccountParameters): WebAuthnAccount {
  const { id, publicKey } = parameters.credential;
  return {
    publicKey,
    async sign({ hash }) {
      const bridge = await createBridge({ message: "Requesting signature…", url: parameters.bridgeUrl });
      try {
        const { signature, metadata: webauthn } = await bridge.request("sign", { credentialId: id, challenge: hash });
        return {
          signature,
          webauthn,
          raw: { id } as never,
        };
      } finally {
        bridge.close();
      }
    },
    async signMessage({ message }) {
      return this.sign({ hash: hashMessage(message) });
    },
    async signTypedData(parameters) {
      return this.sign({ hash: hashTypedData(parameters) });
    },
    type: "webAuthn",
  };
}
