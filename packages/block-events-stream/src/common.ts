import { Observable } from "rxjs";
import type { BlockNumber, GetLogsReturnType, Hex } from "viem";
import type { AbiEvent } from "abitype";

export type BlockEvents<TAbiEvent extends AbiEvent> = {
  blockNumber: BlockNumber;
  blockHash: Hex;
  events: GetLogsReturnType<TAbiEvent>; // TODO: refine to be a store event log
};

export type BlockEventsStream<TAbiEvent extends AbiEvent> = Observable<BlockEvents<TAbiEvent>>;

export type ReadonlySubject<TSubject> = Omit<TSubject, "next" | "error" | "complete">;
