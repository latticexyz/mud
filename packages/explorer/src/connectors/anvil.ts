import { EIP1193RequestFn, Transport, WalletRpcSchema, getAddress, http } from "viem";
import { Account, privateKeyToAccount } from "viem/accounts";
import { anvil as anvilChain } from "viem/chains";
import { createConnector } from "wagmi";

export const defaultAnvilAccounts = (
  [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
    "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
    "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
    "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
    "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
    "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
  ] as const
).map((pk) => privateKeyToAccount(pk));

export type AnvilConnectorOptions = {
  id: string;
  name: string;
  accounts: readonly Account[];
};

const isAnvil = Number(process.env.NEXT_PUBLIC_CHAIN_ID) === anvilChain.id;

export function anvil({ id, name, accounts }: AnvilConnectorOptions) {
  if (!accounts.length) throw new Error("missing accounts");

  type Provider = ReturnType<Transport<"http", unknown, EIP1193RequestFn<WalletRpcSchema>>>;

  let connected = false;
  return createConnector<Provider>((config) => ({
    id,
    name,
    type: "anvil",
    async connect() {
      connected = true;
      return {
        accounts: accounts.map((a) => a.address),
        chainId: anvilChain.id,
      };
    },
    async disconnect() {
      connected = false;
    },
    async getAccounts() {
      return accounts.map((a) => a.address);
    },
    async getChainId() {
      return anvilChain.id;
    },
    async getProvider() {
      return http()({ chain: anvilChain });
    },
    async isAuthorized() {
      if (!isAnvil) return false;
      if (!connected) return false;

      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    async onAccountsChanged() {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x.address)),
        });
    },
    async onDisconnect() {
      config.emitter.emit("disconnect");
      connected = false;
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit("change", { chainId });
    },
  }));
}
