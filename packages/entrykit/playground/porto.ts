import { mode, porto as portoConnector, toCoinbaseSmartAccount } from "@latticexyz/id/internal";
import { LocalAccount, createClient } from "viem";
import { getBundlerTransport } from "../src/getBundlerTransport";
import { createBundlerClient } from "../src/createBundlerClient";
import { smartAccountActions } from "permissionless";

export function porto() {
  return portoConnector(
    {
      mode: mode(),
    },
    ({ chains, transports, provider }) => ({
      async getClient({ chainId } = {}) {
        if (!chainId) throw new Error(`getClient called without a chain ID.`);

        const chain = chains.find((c) => c.id === chainId);
        if (!chain) throw new Error(`Could not find configured chain for chain ID ${chainId}.`);

        const transport = transports?.[chain.id];
        if (!transport) {
          throw new Error(`Could not find configured transport for chain ID ${chainId}.`);
        }
        const client = createClient({ chain, transport });

        const owner = {
          type: "local",
          address: "0x", // TODO
          publicKey: "0x", // TODO
          source: "id.place",
          async sign({ hash }) {
            return await provider.request({ method: "personal_sign", params: [hash, "0x"] });
          },
          async signMessage() {
            throw new Error("not implemented");
          },
          async signTransaction() {
            throw new Error("not implemented");
          },
          async signTypedData() {
            throw new Error("not implemented");
          },
        } satisfies LocalAccount;

        const account = await toCoinbaseSmartAccount({
          client,
          owners: [owner],
        });

        const bundlerClient = createBundlerClient({
          transport: getBundlerTransport(chain),
          client,
          account,
        });

        return bundlerClient.extend(smartAccountActions);
      },
    }),
  );
}
