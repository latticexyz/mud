import { wait } from "@latticexyz/common/utils";
import { Hex, Provider, WebAuthnP256 } from "ox";
import { Account, Key, Mode } from "porto";

export function mode() {
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
        const credential = await WebAuthnP256.createCredential({ name: "test" });
        const key = Key.fromWebAuthnP256({
          credential,
        });
        const account = Account.from({
          address: Hex.random(20),
          keys: [key],
        });
        return { account };
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
        console.log("popup.mode.signTypedData");
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
