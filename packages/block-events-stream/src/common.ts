import { BehaviorSubject, Observable } from "rxjs";
import type { BlockNumber, GetLogsReturnType, Hex } from "viem";
import type { AbiEvent } from "abitype";
import { NonPendingLog } from "./isNonPendingLog";

export type BlockEvents<TAbiEvent extends AbiEvent> = {
  blockNumber: BlockNumber;
  blockHash: Hex;
  events: NonPendingLog<GetLogsReturnType<TAbiEvent, true>[number]>[];
};

export type BlockEventsStream<TAbiEvent extends AbiEvent> = Observable<BlockEvents<TAbiEvent>>;

export type ReadonlyBehaviorSubject<T> = Pick<BehaviorSubject<T>, "subscribe" | "value" | "getValue">;

export type BlockEventsFromStream<TStream extends BlockEventsStream<AbiEvent>> = TStream extends BlockEventsStream<
  infer TAbiEvent
>
  ? BlockEvents<TAbiEvent>
  : never;
