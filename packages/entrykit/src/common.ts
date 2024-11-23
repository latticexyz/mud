import { resourceToHex } from "@latticexyz/common";
import { Client, Chain, Transport, Account, parseAbi, ClientConfig, Address } from "viem";
import worldConfig from "@latticexyz/world/mud.config";

export type ConnectedClient<chain extends Chain = Chain> = Client<Transport, chain, Account>;
export type SessionClient<chain extends Chain = Chain> = ConnectedClient<chain> & { readonly userAddress: Address };

export const defaultClientConfig = {
  pollingInterval: 250,
} as const satisfies Pick<ClientConfig, "pollingInterval">;

export const unlimitedDelegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

export const worldTables = worldConfig.namespaces.world.tables;

export const worldAbi = parseAbi([
  "function registerDelegation(address delegatee, bytes32 delegationControlId, bytes initCallData)",
]);
