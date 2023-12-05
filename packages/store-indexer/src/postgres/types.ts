import { Hex } from "viem";

export type RecordData = {
  address: Hex;
  tableId: Hex;
  keyBytes: Hex;
  staticData: Hex | null;
  encodedLengths: Hex | null;
  dynamicData: Hex | null;
  lastUpdatedBlockNumber: bigint;
};

export type RecordMetadata = {
  indexerVersion: string;
  chainId: string;
  chainBlockNumber: bigint;
  totalRows: number;
};

export type Record = RecordData & RecordMetadata;
