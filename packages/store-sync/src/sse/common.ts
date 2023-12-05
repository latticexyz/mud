import { StorageAdapterLog } from "../common";

export type ServerSentEvents = {
  readonly [eventName: string]: {
    readonly [key: string]: any; // TODO: refine to JSON-safe types?
  };
};

// TODO: test that this satisfies ServerSentEvents?
export type Events = {
  config: {
    indexerVersion: string;
    chainId: string; // TODO: number
    lastUpdatedBlockNumber: string; // TODO: bigint
    totalRows: number;
  };
  log: StorageAdapterLog;
};
