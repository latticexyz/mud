import { EntityIndex } from "@latticexyz/recs";
import { NetworkLayer } from "../../Network";

export function attackEntity(network: NetworkLayer, attacker: EntityIndex, defender: EntityIndex) {
  const {
    world,
    api: { attackEntity },
  } = network;

  const attackerEntityID = world.entities[attacker];
  const defenderEntityID = world.entities[defender];

  attackEntity(attackerEntityID, defenderEntityID);
}
