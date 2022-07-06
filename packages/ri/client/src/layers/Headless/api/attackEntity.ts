import { EntityIndex } from "@latticexyz/recs";
import { HeadlessLayer } from "../types";

export function attackEntity(layer: HeadlessLayer, attacker: EntityIndex, defender: EntityIndex) {
  const {
    world,
    parentLayers: {
      network: {
        api: { attackEntity },
      },
    },
  } = layer;

  const attackerEntityID = world.entities[attacker];
  const defenderEntityID = world.entities[defender];

  attackEntity(attackerEntityID, defenderEntityID);
}
