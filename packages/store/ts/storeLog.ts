import { Log } from "viem";
import { StoreEventsAbiItem, StoreEventsAbi, StoreSetRecordEventAbiItem } from "./storeEventsAbi";

export type StoreLog = Log<bigint, number, false, StoreEventsAbiItem, true, StoreEventsAbi>;
export type StoreSetRecordLog = Log<bigint, number, false, StoreSetRecordEventAbiItem, true>;
