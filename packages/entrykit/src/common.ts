import { resourceToHex } from "@latticexyz/common";
import { Client, Chain, Transport, Account, parseAbi, ClientConfig, Address, LocalAccount } from "viem";
import worldConfig from "@latticexyz/world/mud.config";
import { SmartAccount } from "viem/account-abstraction";

export type ConnectedClient<chain extends Chain = Chain> = Client<Transport, chain, Account>;
export type SessionClient<chain extends Chain = Chain> = Client<Transport, chain, SmartAccount> & {
  readonly userAddress: Address;
  /** @internal */
  readonly internal_signer: LocalAccount;
};

export const defaultClientConfig = {
  pollingInterval: 250,
} as const satisfies Pick<ClientConfig, "pollingInterval">;

// TODO: move to world
export const unlimitedDelegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

export const worldTables = worldConfig.namespaces.world.tables;

export const worldAbi = parseAbi([
  "function registerDelegation(address delegatee, bytes32 delegationControlId, bytes initCallData)",
]);
