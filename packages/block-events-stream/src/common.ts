import { Observable } from "rxjs";
import type { BlockNumber, BlockTag, GetLogsReturnType, Hex } from "viem";
import type { AbiEvent } from "abitype";

// TODO: support pending blocks
export type BlockNumberOrTag = BlockNumber<bigint> | Exclude<BlockTag, "pending">;

export type BlockEvents<TAbiEvent extends AbiEvent> = {
  blockNumber: BlockNumber<bigint>;
  blockHash: Hex;
  events: GetLogsReturnType<TAbiEvent>; // TODO: refine to be a store event log
};

export type BlockEventsStream<TAbiEvent extends AbiEvent> = Observable<BlockEvents<TAbiEvent>>;
