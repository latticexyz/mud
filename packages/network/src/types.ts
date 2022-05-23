import { Cached } from "@mud/utils";
import { BaseContract } from "ethers";
import { Result } from "ethers/lib/utils";
import { Observable, Subject } from "rxjs";

export type Contracts = {
  [key: string]: BaseContract;
};

export type ContractAddressInterface<C extends Contracts> = {
  [key in keyof C]: { address: C[key]["address"]; interface: string | string[] };
};

export type TxQueue<C extends Contracts> = Cached<C>;

export type ContractTopics<C extends Contracts> = {
  key: keyof C;
  topics: string[][];
};

export type ContractEvent<C extends Contracts> = {
  contractKey: keyof C;
  eventKey: string;
  args: Result;
  txHash: string;
  lastEventInTx: boolean;
};

export interface ContractsEventStreamConfig<C extends Contracts> {
  contractTopics: ContractTopics<C>[];
  initialBlockNumber?: number;
}

export type ContractsEventStream<C extends Contracts> = {
  config$: Subject<ContractsEventStreamConfig<C>>;
  eventStream$: Observable<ContractEvent<C>>;
};
