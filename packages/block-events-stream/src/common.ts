import { BehaviorSubject, Observable } from "rxjs";
import type { BlockNumber, Hex } from "viem";
import type { AbiEvent } from "abitype";
import { NonPendingLog } from "./isNonPendingLog";
import { GetLogsReturnType } from "./getLogs";

export type ReadonlyBehaviorSubject<T> = Pick<BehaviorSubject<T>, "subscribe" | "pipe" | "value" | "getValue">;

export type BlockEvents<TAbiEvent extends AbiEvent> = {
  blockNumber: BlockNumber;
  blockHash: Hex;
  events: NonPendingLog<GetLogsReturnType<TAbiEvent[]>>[];
};

export type BlockEventsStream<TAbiEvent extends AbiEvent> = Observable<BlockEvents<TAbiEvent>>;

export type BlockEventsFromStream<TStream extends BlockEventsStream<AbiEvent>> = TStream extends BlockEventsStream<
  infer TAbiEvent
>
  ? BlockEvents<TAbiEvent>
  : never;
