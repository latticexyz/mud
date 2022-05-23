import { PromiseValue } from "@mudkit/utils";
import { createLocalLayer } from "./createLocalLayer";

export type LocalLayer = PromiseValue<ReturnType<typeof createLocalLayer>>;

export enum LocalEntityTypes {
  Imp,
}
