import { PromiseValue } from "@latticexyz/utils";
import { createNetworkLayer } from "./createNetworkLayer";

export type NetworkLayer = PromiseValue<ReturnType<typeof createNetworkLayer>>;
export type NetworkComponents = NetworkLayer["components"];

// Contract types
export enum ContractWorldEvent {
  ComponentValueSet = "ComponentValueSet",
  ComponentValueRemoved = "ComponentValueRemoved",
}

export enum EntityTypes {
  Creature,
  Wall,
}
