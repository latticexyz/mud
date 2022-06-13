import { createWorld, Entity } from "@latticexyz/recs";
import { NetworkLayer } from "../Network";
import { WorldCoord } from "../../types";
import { createActionSystem } from "./systems";
import { defineActionComponent } from "./components";

/**
 * The Headless layer is the second layer in the client architecture and extends the Network layer.
 * Its purpose is to provide an API that allows the game to be played programatically.
 */

export async function createHeadlessLayer(network: NetworkLayer) {
  const world = createWorld({ parentWorld: network.world, name: "Headless" });

  const Action = defineActionComponent(world);
  const components = { Action };

  const actions = createActionSystem(world, Action, network.txReduced$);

  return { world, actions, parentLayers: { network }, components };
}
