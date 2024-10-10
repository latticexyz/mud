import { resourceToHex } from "@latticexyz/common";
import { Client, Chain, Transport, Account, RpcSchema, PublicActions, WalletActions, parseAbi } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import worldConfig from "@latticexyz/world/mud.config";

// TODO: it'd be great if we could have strong types around `client.type` to do downstream checks
export type AppAccountClient = Client<
  Transport,
  Chain,
  Account,
  RpcSchema | undefined,
  PublicActions<Transport, Chain> & WalletActions<Chain, Account>
>;

export const unlimitedDelegationControlId = resourceToHex({ type: "system", namespace: "", name: "unlimited" });

export const defaultPollingInterval = 250;

// ERC-4337

export const entryPointAddress = entryPoint07Address;
/**
 * `deposits` storage variable position in the entry point contract,
 * used to override contract state when doing paymaster gas estimation.
 */
export const entryPointDepositsSlot = 0n;

export const worldTables = worldConfig.namespaces.world.tables;

export const worldAbi = parseAbi([
  "function registerDelegation(address delegatee, bytes32 delegationControlId, bytes initCallData)",
]);
