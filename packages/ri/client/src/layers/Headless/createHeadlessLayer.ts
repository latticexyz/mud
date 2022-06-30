import { defineComponent, EntityIndex, Type, namespaceWorld } from "@latticexyz/recs";
import { NetworkLayer } from "../Network";
import { createActionSystem, createCurrentStaminaSystem } from "./systems";
import { defineActionComponent } from "./components";
import { joinGame, moveEntity } from "./api";
import { curry } from "lodash";
import { Direction } from "../../constants";
import { createTurnStream } from "./setup";

/**
 * The Headless layer is the second layer in the client architecture and extends the Network layer.
 * Its purpose is to provide an API that allows the game to be played programatically.
 */

export async function createHeadlessLayer(network: NetworkLayer) {
  const world = namespaceWorld(network.world, "headless");
  const {
    components: { GameConfig },
    network: { clock },
  } = network;

  const Action = defineActionComponent(world);
  const LocalStamina = defineComponent(world, { current: Type.Number }, { id: "LocalStamina" });
  const components = { Action, LocalStamina };

  const actions = createActionSystem(world, Action, network.txReduced$);

  const layer = {
    world,
    actions,
    parentLayers: { network },
    turn$: createTurnStream(world, GameConfig, clock),
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
