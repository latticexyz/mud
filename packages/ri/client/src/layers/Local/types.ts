import { PromiseValue } from "@mud/utils";
import { createLocalLayer } from "./createLocalLayer";

export type LocalLayer = PromiseValue<ReturnType<typeof createLocalLayer>>;

export enum LocalEntityTypes {
  Imp,
}
