import { wait } from "@latticexyz/common/utils";
import { AbiParameters, Hex, Provider, PublicKey, Secp256k1, WebAuthnP256 } from "ox";
import { Key, Mode } from "porto";
import { Account } from "porto/viem";
import { toCoinbaseSmartAccount } from "../account/toCoinbaseSmartAccount";
import { entryPoint07Abi, toWebAuthnAccount } from "viem/account-abstraction";
import { rp as productionRp } from "@latticexyz/id.place/internal";
import { WebAuthnKey } from "porto/viem/Key";
import { createBundlerClient } from "../../../../packages/entrykit/src/createBundlerClient";
import { getBundlerTransport } from "../../../../packages/entrykit/src/getBundlerTransport";
import * as PreCalls from "./preCalls";
import { defineCall } from "../../../../packages/entrykit/src/utils/defineCall";
import { abi } from "../account/abi";
import { parseEventLogs } from "viem";
import { storeEventsAbi } from "@latticexyz/store";
import { getPossiblePublicKeys } from "./getPossiblePublicKeys";
import { readContract } from "viem/actions";

const rp = import.meta.env.PROD ? productionRp : { id: "id.smartpass.dev", name: "id.smartpass.dev" };

export function mode(): Mode.Mode {
  let lastKey: WebAuthnKey | undefined;

  return Mode.from({
    name: "contract",
    actions: {
      async createAccount(parameters) {
        console.log("popup.mode.createAccount");

        const {
          internal: {
            client,
            config: { storage },
          },
        } = parameters;

        const eoaPrivateKey = Secp256k1.randomPrivateKey();
        const eoa = Account.fromPrivateKey(eoaPrivateKey);
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

        PreCalls.add(
          [
            {
              type: "bootstrap",
              eoa: {
                privateKey: eoaPrivateKey,
              },
              credential: {
                id: key.privateKey!.credential!.id,
                publicKey: key.publicKey,
              },
            },
          ],
          {
            address: smartAccount.address,
            storage,
          },
        );

        const account = Account.from({
          address: smartAccount.address,
          keys: [key],
        });

        lastKey = key;

        return {
          account,
        };
      },

      async loadAccounts(parameters) {
        console.log("popup.mode.loadAccounts", parameters);

        const {
          internal: {
            client,
            config: { storage },
          },
        } = parameters;

        const key = await (async () => {
          if (parameters.address && parameters.key?.credentialId) {
            return Key.fromWebAuthnP256({
              credential: {
                id: parameters.key.credentialId,
                publicKey: PublicKey.fromHex(parameters.key.publicKey),
              },
              rpId: rp.id,
              id: parameters.address,
            });
          }

          if (
            lastKey &&
            (parameters.key == null || parameters.key.credentialId === lastKey.privateKey?.credential?.id)
          ) {
            return lastKey;
          }

          const challenge = Hex.random(256);
          const signature = await WebAuthnP256.sign({
            challenge: challenge,
            rpId: rp.id,
          });
          const credentialId = signature.raw.id;
          const response = signature.raw.response as AuthenticatorAssertionResponse;
          const address = response.userHandle ? Hex.fromBytes(new Uint8Array(response.userHandle)) : null;
          if (!address) throw new Error("no userHandle/address for passkey");

          const preCalls = (await PreCalls.get({ address, storage })) ?? [];
          for (const preCall of preCalls) {
            if (preCall.type === "bootstrap" && preCall.credential.id === credentialId) {
              return Key.fromWebAuthnP256({
                credential: {
                  id: credentialId,
                  publicKey: PublicKey.fromHex(preCall.credential.publicKey),
                },
                rpId: rp.id,
                id: address,
              });
            }
          }

          const possiblePublicKeys = getPossiblePublicKeys({ challenge, signature });

          const nextOwnerIndex = await readContract(client, {
            address,
            abi,
            functionName: "nextOwnerIndex",
          });

          // TODO: batch this
          const encodedOwners = new Set(
            await Promise.all(
              Array.from({ length: Number(nextOwnerIndex) }).map((_, i) =>
                readContract(client, {
                  address,
                  abi,
                  functionName: "ownerAtIndex",
                  args: [BigInt(i)],
                }),
              ),
            ),
          );

          const publicKey = possiblePublicKeys.find((publicKey) =>
            encodedOwners.has(
              AbiParameters.encode(AbiParameters.from(["bytes32", "bytes32"]), [
                Hex.fromNumber(publicKey.x),
                Hex.fromNumber(publicKey.y),
              ]),
            ),
          );
          if (!publicKey) throw new Error("passkey not an owner of account");

          return Key.fromWebAuthnP256({
            credential: {
              id: credentialId,
              publicKey,
            },
            rpId: rp.id,
            id: address,
          });
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

      async sendCalls(parameters) {
        console.log("popup.mode.sendCalls", parameters);

        const {
          account,
          calls,
          internal: {
            client,
            config: { storage },
          },
        } = parameters;

        const key = account.keys?.find(
          (key): key is WebAuthnKey => key.role === "admin" && key.type === "webauthn-p256",
        );
        if (!key) throw new Error("no key for account");
        if (!key.privateKey?.credential) throw new Error("no credential for key");

        const smartAccount = await toCoinbaseSmartAccount({
          client,
          address: key.id,
          owners: ["0x", toViemAccount(key)],
          ownerIndex: 1,
        });
        console.log("smart account", {
          expectedAddress: key.id,
          actualAddress: account.address,
        });

        const bundlerClient = createBundlerClient({
          transport: getBundlerTransport(client.chain),
          client,
        });

        const request = await bundlerClient.prepareUserOperation({ account: smartAccount, calls });
        request.signature = await smartAccount.signUserOperation(request);

        const preCalls = (await PreCalls.get({ address: smartAccount.address, storage })) ?? [];
        console.log("got precalls for", smartAccount.address, preCalls);
        PreCalls.clear({ address: smartAccount.address, storage });

        // TODO: move this to some prepare call helper?
        // TODO: can we do precalls + request atomically? they're signed by different accounts

        const preCallHashes: Hex.Hex[] = [];
        for (const preCall of preCalls) {
          if (preCall.type === "bootstrap") {
            console.log("bootstrapping account");
            const eoa = Account.fromPrivateKey(preCall.eoa.privateKey);
            const publicKey = PublicKey.fromHex(preCall.credential.publicKey);
            preCallHashes.push(
              await bundlerClient.sendUserOperation({
                account: await toCoinbaseSmartAccount({
                  client,
                  owners: [eoa],
                }),
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
              }),
            );
          } else {
            throw new Error(`unsupported preCall: ${preCall.type}`);
          }
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
        const userOpHash = await bundlerClient.sendUserOperation(request);

        return { id: userOpHash };
      },

      async addFunds(parameters) {
        console.log("popup.mode.addFunds", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async getAccountVersion(parameters) {
        console.log("popup.mode.getAccountVersion", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async getCallsStatus(parameters) {
        console.log("popup.mode.getCallsStatus", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async getCapabilities(parameters) {
        console.log("popup.mode.getCapabilities", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async getKeys(parameters) {
        console.log("popup.mode.getKeys", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async grantAdmin(parameters) {
        console.log("popup.mode.grantAdmin", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async grantPermissions(parameters) {
        console.log("popup.mode.grantPermissions", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async prepareCalls(parameters) {
        console.log("popup.mode.prepareCalls", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async prepareUpgradeAccount(parameters) {
        console.log("popup.mode.prepareUpgradeAccount", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async revokeAdmin(parameters) {
        console.log("popup.mode.revokeAdmin", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async revokePermissions(parameters) {
        console.log("popup.mode.revokePermissions", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async sendPreparedCalls(parameters) {
        console.log("popup.mode.sendPreparedCalls", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async signPersonalMessage(parameters) {
        console.log("popup.mode.signPersonalMessage", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async signTypedData(parameters) {
        console.log("popup.mode.signTypedData", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async updateAccount(parameters) {
        console.log("popup.mode.updateAccount", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async upgradeAccount(parameters) {
        console.log("popup.mode.upgradeAccount", parameters);
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
      },
      async verifyEmail(parameters) {
        console.log("popup.mode.verifyEmail", parameters);
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
