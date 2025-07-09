import { Mode, Account } from "porto";
import { connectRp } from "../client/connectRp";
import { createTimeout } from "../createTimeout";
import { syncPort } from "../sync/syncPort";
import { sharedState } from "../sync/sharedState";

const rp = connectRp();
rp.port.then((port) => syncPort("rp", port));

async function createAccount() {
  const port = await rp.port;
  return await new Promise<Account.Account>((resolve, reject) => {
    function onPortMessage(event: MessageEvent) {
      if (event.data === "createResult") {
        console.log("got create result");
        resolve({} as never);
      }
    }
    port.addEventListener("message", onPortMessage);

    const timeout = createTimeout(60_000);
    timeout.promise.finally(() => port.removeEventListener("message", onPortMessage));
    timeout.promise.catch(reject);

    console.log("asking port to create account");
    port.postMessage("create");
  });
}

export const mode = Mode.from({
  name: "rp",
  actions: {
    async createAccount() {
      console.log("mode.actions.createAccount()");
      const account = await createAccount();
      return { account };
    },

    async loadAccounts() {
      console.log("mode.actions.loadAccounts()");

      const accounts = sharedState.getState().accounts;

      if (!accounts.length) {
        console.log("create account");
        await createAccount();
        throw new Error("failed");
      } else {
        console.log("TODO sign in");
        // sign in?
      }

      return { accounts: [] };
    },

    addFunds() {
      console.log("mode.actions.addFunds()");
      throw new Error("Not implemented.");
    },
    disconnect() {
      console.log("mode.actions.disconnect()");
      throw new Error("Not implemented.");
    },
    getAccountVersion() {
      console.log("mode.actions.getAccountVersion()");
      throw new Error("Not implemented.");
    },
    getCallsStatus() {
      console.log("mode.actions.getCallsStatus()");
      throw new Error("Not implemented.");
    },
    getCapabilities() {
      console.log("mode.actions.getCapabilities()");
      throw new Error("Not implemented.");
    },
    getKeys() {
      console.log("mode.actions.getKeys()");
      throw new Error("Not implemented.");
    },
    grantAdmin() {
      console.log("mode.actions.grantAdmin()");
      throw new Error("Not implemented.");
    },
    grantPermissions() {
      console.log("mode.actions.grantPermissions()");
      throw new Error("Not implemented.");
    },
    prepareCalls() {
      console.log("mode.actions.prepareCalls()");
      throw new Error("Not implemented.");
    },
    prepareUpgradeAccount() {
      console.log("mode.actions.prepareUpgradeAccount()");
      throw new Error("Not implemented.");
    },
    revokeAdmin() {
      console.log("mode.actions.revokeAdmin()");
      throw new Error("Not implemented.");
    },
    revokePermissions() {
      console.log("mode.actions.revokePermissions()");
      throw new Error("Not implemented.");
    },
    sendCalls() {
      console.log("mode.actions.sendCalls()");
      throw new Error("Not implemented.");
    },
    sendPreparedCalls() {
      console.log("mode.actions.sendPreparedCalls()");
      throw new Error("Not implemented.");
    },
    signPersonalMessage() {
      console.log("mode.actions.signPersonalMessage()");
      throw new Error("Not implemented.");
    },
    signTypedData() {
      console.log("mode.actions.signTypedData()");
      throw new Error("Not implemented.");
    },
    updateAccount() {
      console.log("mode.actions.updateAccount()");
      throw new Error("Not implemented.");
    },
    upgradeAccount() {
      console.log("mode.actions.upgradeAccount()");
      throw new Error("Not implemented.");
    },
    verifyEmail() {
      console.log("mode.actions.verifyEmail()");
      throw new Error("Not implemented.");
    },
  },
});
