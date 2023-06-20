import { Observable } from "rxjs";
import type { BlockNumber, GetLogsReturnType, Hex } from "viem";
import type { AbiEvent } from "abitype";

// TODO: default to store abi events?
export type BlockEvents<TAbiEvent extends AbiEvent> = {
  blockNumber: BlockNumber;
  blockHash: Hex;
  events: GetLogsReturnType<TAbiEvent, true>; // TODO: refine to be a store event log
};

// TODO: default to store abi events?
export type BlockEventsStream<TAbiEvent extends AbiEvent> = Observable<BlockEvents<TAbiEvent>>;

export type ReadonlySubject<TSubject> = Omit<TSubject, "next" | "error" | "complete">;
