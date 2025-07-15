import { wait } from "@latticexyz/common/utils";
import { Hex, Json, Provider, PublicKey, Signature, TypedData, WebAuthnP256 } from "ox";
import { Key, Mode } from "porto";
import { Account } from "porto/viem";
import { toCoinbaseSmartAccount } from "../account/toCoinbaseSmartAccount";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { rp } from "../rp/common";
import { getKey } from "porto/viem/Account";
import { WebAuthnKey } from "porto/viem/Key";

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
        const credential = await WebAuthnP256.createCredential({ name: "test", rp });
        const owner = toWebAuthnAccount({
          credential: {
            id: credential.id,
            publicKey: PublicKey.toHex(credential.publicKey),
          },
          rpId: rp.id,
        });

        const account = await toCoinbaseSmartAccount({ client: parameters.internal.client, owners: [owner] });

        return {
          account: Account.from({
            address: account.address,
            keys: [Key.fromWebAuthnP256({ credential, rpId: rp.id })],
            async sign(params) {
              console.log("account.sign called", params);
              return account.sign(params);
            },
          }),
        };
        // throw new Provider.UnsupportedMethodError();
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
        console.log("popup.mode.loadAccounts");
        const signature = await WebAuthnP256.sign({ challenge: "0x" });
        throw new Provider.UnsupportedMethodError();
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
        console.log("popup.mode.sendCalls");
        await wait(1000);
        throw new Provider.UnsupportedMethodError();
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
        console.log("popup.mode.signTypedData", parameters, parameters.internal.store.getState());

        const key = parameters.account.keys?.find(
          (key): key is WebAuthnKey => key.role === "admin" && key.type === "webauthn-p256",
        );
        if (!key) throw new Error("no key for account");
        if (!key.privateKey?.credential) throw new Error("no credential for key");

        console.log("using key", key);
        // await wait(30_000);

        // We can't use `Key.sign` here because Porto assumes `userHandle` is set to the signing address.
        // But we don't know that address ahead of time.
        // const { signature } = await WebAuthnP256.sign({
        //   challenge: TypedData.getSignPayload(Json.parse(parameters.data)),
        //   credentialId: key.privateKey.credential.id,
        //   rpId: key.privateKey.rpId,
        //   // userVerification: requireVerification ? "required" : "preferred",
        // });
        // return Signature.toHex(signature);

        // await wait(30_000);
        const owner = toWebAuthnAccount({
          credential: {
            id: key.privateKey.credential.id,
            publicKey: key.publicKey,
          },
          rpId: rp.id,
        });

        const account = await toCoinbaseSmartAccount({ client: parameters.internal.client, owners: [owner] });

        return await account.signTypedData(Json.parse(parameters.data));
        // const { account, data, internal } = parameters;

        // // Only admin keys can sign typed data.
        // const key = account.keys?.find((key) => key.role === "admin" && key.privateKey);
        // if (!key) throw new Error("cannot find admin key to sign with.");

        // const signature = await Account.sign(account, {
        //   key,
        //   payload: TypedData.getSignPayload(Json.parse(data)),
        //   storage: internal.config.storage,
        // });

        // return signature;
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
