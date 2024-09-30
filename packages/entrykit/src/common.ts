import { resourceToHex } from "@latticexyz/common";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { Client, Chain, Transport, Account, RpcSchema, PublicActions, WalletActions } from "viem";

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

export const entryPointAddress = ENTRYPOINT_ADDRESS_V07;
/**
 * `deposits` storage variable position in the entry point contract,
 * used to override contract state when doing paymaster gas estimation.
 */
export const entryPointDepositsSlot = 0n;
// TODO: should this be configurable or part of the chain contracts?
export const smartAccountFactory = "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985";
