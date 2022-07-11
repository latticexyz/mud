import { createHeadlessLayer } from "./createHeadlessLayer";

export type HeadlessLayer = Awaited<ReturnType<typeof createHeadlessLayer>>;
