import { parseAbi, AbiEvent } from "abitype";
import { storeEvents } from "./storeEvents";

export const storeEventsAbi = parseAbi(storeEvents) satisfies readonly AbiEvent[];

export type StoreEventsAbi = typeof storeEventsAbi;
export type StoreEventsAbiItem = (typeof storeEventsAbi)[number];
