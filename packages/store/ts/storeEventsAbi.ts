import { parseAbi, AbiEvent } from "abitype";
import { storeEvents } from "./storeEvents";

export const storeEventsAbi = parseAbi(storeEvents) satisfies readonly AbiEvent[];
