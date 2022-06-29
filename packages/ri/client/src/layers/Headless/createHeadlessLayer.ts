import { EntityIndex } from "@latticexyz/recs";
import { NetworkLayer } from "../Network";
import { createActionSystem, createCurrentStaminaSystem } from "./systems";
import { defineActionComponent } from "./components";
import { joinGame, moveEntity } from "./api";
import { curry } from "lodash";
import { Direction } from "../../constants";
import { defineNumberComponent } from "@latticexyz/std-client";

/**
 * The Headless layer is the second layer in the client architecture and extends the Network layer.
 * Its purpose is to provide an API that allows the game to be played programatically.
 */

export async function createHeadlessLayer(network: NetworkLayer) {
  const world = network.world;
  const Action = defineActionComponent(world);
  const LocalCurrentStamina = defineNumberComponent(world, { id: "LocalCurrentStamina" });
  const components = { Action, LocalCurrentStamina };

  const actions = createActionSystem(world, Action, network.txReduced$);

  const layer = {
    world,
    actions,
    parentLayers: { network },
    components,
    api: {
      joinGame: curry(joinGame)(network, actions),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      moveEntity: (entity: EntityIndex, direction: Direction) => {
        "no-op for types";
      },
    },
  };

  layer.api.moveEntity = curry(moveEntity)(layer, actions);

  createCurrentStaminaSystem(layer);

  return layer;
}
