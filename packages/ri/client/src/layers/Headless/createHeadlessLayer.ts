import { defineComponent, Type, namespaceWorld } from "@latticexyz/recs";
import { NetworkLayer } from "../Network";
import { createActionSystem, createCurrentStaminaSystem } from "./systems";
import { defineActionComponent } from "./components";
import { joinGame, moveEntity, attackEntity } from "./api";
import { curry } from "lodash";
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

  const turn$ = createTurnStream(world, GameConfig, clock);

  const layer = {
    world,
    actions,
    parentLayers: { network },
    components,
    turn$,
    api: {
      joinGame: curry(joinGame)(network, actions),
      moveEntity: curry(moveEntity)({ world, actions, network, LocalStamina }),
      attackEntity: curry(attackEntity)({ network, actions }),
    },
  };

  createCurrentStaminaSystem(layer);

  return layer;
}
