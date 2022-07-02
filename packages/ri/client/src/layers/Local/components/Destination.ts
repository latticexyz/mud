import { World } from "@latticexyz/recs";
import { defineCoordComponent } from "@latticexyz/std-client";

export function defineDestinationComponent(world: World) {
  return defineCoordComponent(world, { id: "Destination" });
}
