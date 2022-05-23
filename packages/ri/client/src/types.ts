import { boot } from "./boot";
import { PromiseValue } from "@mudkit/utils";

export interface WorldCoord {
  x: number;
  y: number;
}

export type EmberWindow = PromiseValue<ReturnType<typeof boot>>;
