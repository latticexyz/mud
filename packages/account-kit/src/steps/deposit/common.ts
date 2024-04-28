import { RelayChain } from "@reservoir0x/relay-sdk";
import { Chain, Hex, TransactionReceipt } from "viem";

export type DepositMethod = "transfer" | "bridge" | "relay";

export type SourceChain = Chain & {
  depositMethods: readonly DepositMethod[];
  portalAddress: Hex | undefined;
  relayChain: RelayChain | undefined;
};

export type BridgeTransaction = {
  readonly amount: bigint;
  readonly chainL1: Pick<Chain, "id" | "name" | "blockExplorers">;
  readonly chainL2: Pick<Chain, "id" | "name" | "blockExplorers">;
  readonly hashL1: Hex;
  readonly receiptL1: Promise<{ receiptL1: TransactionReceipt; hashL2: Hex }>;
  readonly receiptL2: Promise<TransactionReceipt>;
  readonly start: Date;
  readonly estimatedTime: number;
};
