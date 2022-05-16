import { PromiseValue } from "@mud/utils";
import { createHeadlessLayer } from "./createHeadlessLayer";

export type HeadlessLayer = PromiseValue<ReturnType<typeof createHeadlessLayer>>;
