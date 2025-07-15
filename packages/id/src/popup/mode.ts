import { wait } from "@latticexyz/common/utils";
import { Hex, Provider, PublicKey, WebAuthnP256 } from "ox";
import { Key, Mode } from "porto";
import { Account, ServerClient } from "porto/viem";
import { toCoinbaseSmartAccount } from "../account/toCoinbaseSmartAccount";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { rp } from "../rp/common";
import { WebAuthnKey } from "porto/viem/Key";
import { createBundlerClient } from "./createBundlerClient";
import { getBundlerTransport } from "./getBundlerTransport";
import { recoverPublicKey } from "./recoverPublicKey";

export function mode(): Mode.Mode {
  return Mode.from({
    name: "contract",
    actions: {
      async addFunds(parameters) {
        console.log("popup.mode.addFunds");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async createAccount(parameters) {
        console.log("popup.mode.createAccount");

        const {
          internal: { client },
        } = parameters;

        const credential = await WebAuthnP256.createCredential({ name: "test", rp });
        const key = Key.fromWebAuthnP256({ credential, rpId: rp.id });

        const account = await getAccount({ client, key });

        return {
          account: Account.from({
            address: account.address,
            keys: [key],
          }),
        };
      },
      async getAccountVersion(parameters) {
        console.log("popup.mode.getAccountVersion");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async getCallsStatus(parameters) {
        console.log("popup.mode.getCallsStatus");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async getCapabilities(parameters) {
        console.log("popup.mode.getCapabilities");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async getKeys(parameters) {
        console.log("popup.mode.getKeys");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async grantAdmin(parameters) {
        console.log("popup.mode.grantAdmin");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async grantPermissions(parameters) {
        console.log("popup.mode.grantPermissions");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async loadAccounts(parameters) {
        console.log("popup.mode.loadAccounts", parameters);

        const {
          internal: { client },
        } = parameters;

        const key = await (async () => {
          // TODO: figure out how to turn `parameters.address` and `parameters.credentialId` into an account+key
          //       (currently blocked on the fact that we can't look up the `publicKey` easily to create the `Key` for the account)

          const challenge1 = Hex.random(256);
          const signature1 = await WebAuthnP256.sign({
            challenge: challenge1,
            rpId: rp.id,
          });
          const credentialId = signature1.raw.id;

          // TODO: store credential ID hash on create and use it here to look up account address instead of double signing

          const challenge2 = Hex.random(256);
          const signature2 = await WebAuthnP256.sign({
            challenge: challenge2,
            rpId: rp.id,
            credentialId,
          });

          const publicKey = recoverPublicKey([
            { challenge: challenge1, signature: signature1 },
            { challenge: challenge2, signature: signature2 },
          ]);
          if (!publicKey) throw new Error("could not recover public key");

          const key = Key.fromWebAuthnP256({
            credential: {
              id: credentialId,
              publicKey: PublicKey.fromHex(publicKey),
            },
            rpId: rp.id,
          });

          return key;
        })();

        const account = await getAccount({ client, key });
        console.log("got account", account.address, "via passkey", key.publicKey);

        return {
          accounts: [
            Account.from({
              address: account.address,
              keys: [key],
            }),
          ],
        };
      },
      async prepareCalls(parameters) {
        console.log("popup.mode.prepareCalls");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async prepareUpgradeAccount(parameters) {
        console.log("popup.mode.prepareUpgradeAccount");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async revokeAdmin(parameters) {
        console.log("popup.mode.revokeAdmin");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async revokePermissions(parameters) {
        console.log("popup.mode.revokePermissions");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async sendCalls(parameters) {
        console.log("popup.mode.sendCalls", parameters);

        const {
          calls,
          internal: { client },
        } = parameters;

        const key = parameters.account.keys?.find(
          (key): key is WebAuthnKey => key.role === "admin" && key.type === "webauthn-p256",
        );
        if (!key) throw new Error("no key for account");
        if (!key.privateKey?.credential) throw new Error("no credential for key");

        const account = await getAccount({ client, key });

        const bundlerClient = createBundlerClient({
          transport: getBundlerTransport(client.chain),
          client,
          account,
        });

        const userOpHash = await bundlerClient.sendUserOperation({
          account,
          calls,
        });

        return { id: userOpHash };
      },
      async sendPreparedCalls(parameters) {
        console.log("popup.mode.sendPreparedCalls");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async signPersonalMessage(parameters) {
        console.log("popup.mode.signPersonalMessage");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async signTypedData(parameters) {
        console.log("popup.mode.signTypedData", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async updateAccount(parameters) {
        console.log("popup.mode.updateAccount");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async upgradeAccount(parameters) {
        console.log("popup.mode.upgradeAccount");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async verifyEmail(parameters) {
        console.log("popup.mode.verifyEmail");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
    },
  });
}

async function getAccount({ client, key }: { client: ServerClient.ServerClient; key: WebAuthnKey }) {
  return toCoinbaseSmartAccount({
    client,
    owners: [
      toWebAuthnAccount({
        credential: {
          id: key.privateKey!.credential!.id,
          publicKey: key.publicKey,
        },
        rpId: key.privateKey!.rpId,
      }),
    ],
  });
}
