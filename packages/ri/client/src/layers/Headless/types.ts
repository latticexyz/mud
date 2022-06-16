import { PromiseValue } from "@latticexyz/utils";
import { createHeadlessLayer } from "./createHeadlessLayer";
import { createActionSystem } from "./systems";

export type HeadlessLayer = PromiseValue<ReturnType<typeof createHeadlessLayer>>;
export type ActionSystem = ReturnType<typeof createActionSystem>;
