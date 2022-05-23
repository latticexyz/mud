import { PromiseValue } from "@latticexyz/utils";
import { createHeadlessLayer } from "./createHeadlessLayer";

export type HeadlessLayer = PromiseValue<ReturnType<typeof createHeadlessLayer>>;
