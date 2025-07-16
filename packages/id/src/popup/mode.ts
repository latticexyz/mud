import { wait } from "@latticexyz/common/utils";
import { AbiParameters, Address, Hex, Provider, PublicKey, Secp256k1, WebAuthnP256 } from "ox";
import { Key, Mode } from "porto";
import { Account, ServerClient } from "porto/viem";
import { toCoinbaseSmartAccount } from "../account/toCoinbaseSmartAccount";
import { entryPoint07Abi, toWebAuthnAccount } from "viem/account-abstraction";
import { rp } from "../rp/common";
import { WebAuthnKey } from "porto/viem/Key";
import { createBundlerClient } from "./createBundlerClient";
import { getBundlerTransport } from "./getBundlerTransport";
import { recoverPublicKey } from "./recoverPublicKey";
import * as PreCalls from "../../node_modules/porto/core/internal/preCalls";
import { defineCall } from "./defineCall";
import { abi } from "../account/abi";
import { parseEventLogs } from "viem";
import { storeEventsAbi } from "../../../store/ts/storeEventsAbi";

export function mode(): Mode.Mode {
  let lastKey: WebAuthnKey | undefined;

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
          internal: {
            client,
            config: { storage },
          },
        } = parameters;

        const eoa = Account.fromPrivateKey(Secp256k1.randomPrivateKey());
        const smartAccount = await toCoinbaseSmartAccount({
          client,
          owners: [eoa],
        });
        console.log("eoa", eoa.address);

        const key = await Key.createWebAuthnP256({
          label: `${smartAccount.address.slice(0, 8)}\u2026${smartAccount.address.slice(-6)}`,
          rpId: rp.id,
          userId: Hex.toBytes(smartAccount.address),
        });
        const publicKey = PublicKey.fromHex(key.publicKey);

        const bundlerClient = createBundlerClient({
          transport: getBundlerTransport(client.chain),
          client,
          account: smartAccount,
        });

        const auth = await bundlerClient.prepareUserOperation({
          account: smartAccount,
          calls: [
            defineCall({
              to: smartAccount.address,
              abi,
              functionName: "addOwnerPublicKey",
              args: [Hex.fromNumber(publicKey.x), Hex.fromNumber(publicKey.y)],
            }),
            defineCall({
              to: smartAccount.address,
              abi,
              functionName: "removeOwnerAtIndex",
              args: [0n, AbiParameters.encode(AbiParameters.from(["address"]), [eoa.address])],
            }),
          ],
        });
        const authSignature = await smartAccount.signUserOperation(auth);
        const preCalls = [{ context: auth, signature: authSignature }];
        console.log("adding preCalls for", Address.from(smartAccount.address, { checksum: true }), preCalls);
        PreCalls.add(preCalls, {
          address: Address.from(smartAccount.address, { checksum: true }),
          storage,
        });

        const account = Account.from({
          address: smartAccount.address,
          keys: [key],
        });

        lastKey = key;

        return {
          account,
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
          if (
            lastKey &&
            (parameters.credentialId == null || parameters.credentialId === lastKey.privateKey?.credential?.id)
          ) {
            return lastKey;
          }

          // TODO: figure out how to turn `parameters.address` and `parameters.credentialId` into an account+key
          //       (currently blocked on the fact that we can't look up the `publicKey` easily to create the `Key` for the account)

          const challenge1 = Hex.random(256);
          const signature1 = await WebAuthnP256.sign({
            challenge: challenge1,
            rpId: rp.id,
          });
          const credentialId = signature1.raw.id;
          const response = signature1.raw.response as AuthenticatorAssertionResponse;
          const address = response.userHandle ? Hex.fromBytes(new Uint8Array(response.userHandle)) : null;
          if (!address) throw new Error("no userHandle/address for passkey");

          // TODO: look up keys on account instead of double signature

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
            id: address,
          });

          return key;
        })();

        const smartAccount = await toCoinbaseSmartAccount({
          client,
          address: key.id,
          owners: ["0x", toViemAccount(key)],
          ownerIndex: 1,
        });

        console.log("got account", smartAccount.address, "via passkey", key.publicKey);

        const account = Account.from({
          address: smartAccount.address,
          keys: [key],
        });

        lastKey = key;

        return {
          accounts: [account],
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
          internal: {
            client,
            config: { storage },
          },
        } = parameters;

        const key = parameters.account.keys?.find(
          (key): key is WebAuthnKey => key.role === "admin" && key.type === "webauthn-p256",
        );
        if (!key) throw new Error("no key for account");
        if (!key.privateKey?.credential) throw new Error("no credential for key");

        const account = await toCoinbaseSmartAccount({
          client,
          address: key.id,
          owners: ["0x", toViemAccount(key)],
          ownerIndex: 1,
        });
        console.log("smart account", {
          expectedAddress: key.id,
          actualAddress: account.address,
        });

        const preCalls =
          (await PreCalls.get({
            address: Address.from(account.address, { checksum: true }),
            storage,
          })) ?? [];
        console.log("got precalls for", Address.from(account.address, { checksum: true }), preCalls);

        PreCalls.clear({
          address: Address.from(account.address, { checksum: true }),
          storage,
        });

        const bundlerClient = createBundlerClient({
          transport: getBundlerTransport(client.chain),
          client,
        });

        const preCallHashes: Hex.Hex[] = [];
        for (const preCall of preCalls) {
          console.log("sending preCall", preCall);
          preCallHashes.push(
            await bundlerClient.sendUserOperation({
              ...preCall.context,
              signature: preCall.signature,
            }),
          );
        }

        for (const hash of preCallHashes) {
          const result = await bundlerClient.waitForUserOperationReceipt({ hash });
          console.log("got result", result);
          // TODO: better error
          if (!result.success) throw new Error("precall failed");

          console.log(
            "parsed logs",
            parseEventLogs({
              logs: result.receipt.logs,
              abi: [...entryPoint07Abi, ...abi, ...storeEventsAbi],
            }),
          );
        }

        // TODO: catch errors and add precalls back in or clear out account?

        console.log("sending calls", calls);
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

function toViemAccount(key: WebAuthnKey) {
  return toWebAuthnAccount({
    credential: {
      id: key.privateKey!.credential!.id,
      publicKey: key.publicKey,
    },
    rpId: key.privateKey!.rpId,
  });
}
