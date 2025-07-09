import { Mode, Account, Dialog, Porto, RpcSchema as RpcSchema_porto } from "porto";
import { openRp } from "../client/openRp";
import { createTimeout } from "../createTimeout";
import { syncPort } from "../sync/syncPort";
import { sharedState } from "../sync/sharedState";
import { connectUrl } from "../rp/common";

// fix for store type not resolving
import "zustand/middleware";
import { QueuedRequest } from "porto/Porto";
import { Provider, RpcRequest, RpcSchema } from "ox";

// const rp = connectRp();
// rp.port.then((port) => syncPort("rp", port));

// async function createAccount() {
//   const port = await rp.port;
//   return await new Promise<Account.Account>((resolve, reject) => {
//     function onPortMessage(event: MessageEvent) {
//       if (event.data === "createResult") {
//         console.log("got create result");
//         resolve({} as never);
//       }
//     }
//     port.addEventListener("message", onPortMessage);

//     const timeout = createTimeout(60_000);
//     timeout.promise.finally(() => port.removeEventListener("message", onPortMessage));
//     timeout.promise.catch(reject);

//     console.log("asking port to create account");
//     port.postMessage("create");
//   });
// }

export function mode() {
  const renderer = Dialog.popup();

  const listeners = new Set<(requestQueue: readonly QueuedRequest[]) => void>();
  const requestStore = RpcRequest.createStore();

  // Function to instantiate a provider for the dialog. This
  // will be used to queue up requests for the dialog and
  // handle responses.
  function getProvider(store: Porto.Internal["store"]) {
    return Provider.from(
      {
        async request(r) {
          const request = requestStore.prepare(r as any);

          // When we receive a request, we need to add it to the queue.
          store.setState((x) => {
            const account = x.accounts[0];
            const adminKey = account?.keys?.find((key) => key.role === "admin" && key.type === "webauthn-p256");
            return {
              ...x,
              requestQueue: [
                ...x.requestQueue,
                {
                  account: account
                    ? {
                        address: account.address,
                        credentialId: (adminKey as any)?.credentialId,
                      }
                    : undefined,
                  request,
                  status: "pending",
                },
              ],
            };
          });

          // We need to wait for the request to be resolved.
          return new Promise((resolve, reject) => {
            const listener = (requestQueue: readonly QueuedRequest[]) => {
              // Find the request in the queue based off its JSON-RPC identifier.
              const queued = requestQueue.find((x) => x.request.id === request.id);

              // If the request is not found and the queue is empty, reject the request
              // as it will never be resolved (likely cancelled or dialog closed).
              if (!queued && requestQueue.length === 0) {
                listeners.delete(listener);
                reject(new Provider.UserRejectedRequestError());
                return;
              }

              // If request not found but queue has other requests, wait for next update.
              if (!queued) return;

              // If request found but not yet resolved, wait for next update.
              if (queued.status !== "success" && queued.status !== "error") return;

              // We have a response, we can unsubscribe from the listener.
              listeners.delete(listener);

              // If the request was successful, resolve with the result.
              if (queued.status === "success") resolve(queued.result as any);
              // Otherwise, reject with EIP-1193 Provider error.
              else reject(Provider.parseError(queued.error));

              // Remove the request from the queue.
              store.setState((x) => ({
                ...x,
                requestQueue: x.requestQueue.filter((x) => x.request.id !== request.id),
              }));
            };

            listeners.add(listener);
          });
        },
      },
      { schema: RpcSchema.from<RpcSchema_porto.Schema>() },
    );
  }

  return Mode.from({
    name: "rp",
    setup(params) {
      console.log("mode.setup()");
      const dialog = renderer.setup({
        host: connectUrl,
        internal: params.internal,
      });

      const unsub = params.internal.store.subscribe(
        (x) => x.requestQueue,
        (requestQueue) => {
          for (const listener of listeners) listener(requestQueue);

          const requests = requestQueue
            .map((x) => (x.status === "pending" ? x : undefined))
            .filter(Boolean) as readonly QueuedRequest[];
          dialog.syncRequests(requests);
          if (requests.length === 0) dialog.close();
        },
      );

      return () => {
        unsub();
        dialog.destroy();
      };
    },
    actions: {
      async createAccount() {
        console.log("mode.actions.createAccount()");
        throw new Error("not implemented");
        // const account = await createAccount();
        // return { account: Account.from({}) };
      },

      async loadAccounts(params) {
        console.log("mode.actions.loadAccounts()");

        const { internal } = params;
        const { config, store, request } = internal;
        const { storage } = config;

        const provider = getProvider(store);

        if (request.method !== "wallet_connect" && request.method !== "eth_requestAccounts")
          throw new Error("Cannot load accounts for method: " + request.method);

        const accounts = await (async () => {
          // const [{ capabilities }] = request._decoded.params ?? [{}];

          // Parse provided (RPC) key into a structured key.
          // const key = await PermissionsRequest.toKey(capabilities?.grantPermissions, {
          //   feeTokens,
          // });

          // Convert the key into a permissions request.
          // const permissionsRequest = key
          //   ? Schema.encodeSync(PermissionsRequest.Schema)(PermissionsRequest.fromKey(key))
          //   : undefined;

          // Send a request to the dialog.
          console.log("sending request to dialog");
          try {
            const { accounts } = await provider.request({
              method: "wallet_connect",
              params: [
                {
                  ...request.params?.[0],
                  capabilities: {
                    ...request.params?.[0]?.capabilities,
                    // grantPermissions: permissionsRequest,
                  },
                },
              ],
            });
            console.log("request finished", accounts);
          } catch (error) {
            console.error("request failed", error);
            throw error;
          }

          return Promise.all(
            accounts.map(async (account) => {
              // const adminKeys = account.capabilities?.admins
              //   ?.map((key) => Key.from(key))
              //   .filter(Boolean) as readonly Key.Key[];
              // const sessionKeys = account.capabilities?.permissions
              //   ?.map((permission) => {
              //     try {
              //       const key_ = Permissions.toKey(Schema.decodeSync(Permissions.Schema)(permission));
              //       if (key_.id === key?.id) return key;
              //       return key_;
              //     } catch {
              //       return undefined;
              //     }
              //   })
              //   .filter(Boolean) as readonly Key.Key[];

              return {
                ...Account.from({
                  address: account.address,
                  // keys: [...adminKeys, ...sessionKeys],
                }),
              } as const;
            }),
          );
        })();

        return { accounts };
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
}
