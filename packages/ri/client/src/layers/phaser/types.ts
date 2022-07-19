import { createPhaserLayer } from "./createPhaserLayer";

export type PhaserLayer = Awaited<ReturnType<typeof createPhaserLayer>>;
