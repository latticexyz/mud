import { EntityIndex, getComponentValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../Network";
import { ActionSystem } from "../systems";
import { manhattan } from "../../../utils/distance";

export function attackEntity(
  context: { network: NetworkLayer; actions: ActionSystem },
  attacker: EntityIndex,
  defender: EntityIndex
) {
  const { network, actions } = context;
  const {
    world,
    api: { attackEntity },
    components: { Position, Attack },
    utils: { checkOwnEntity },
  } = network;

  const OptimisticPosition = actions.withOptimisticUpdates(Position);

  if (!checkOwnEntity(attacker)) return;

  const attackerAttack = getComponentValue(Attack, attacker);
  if (!attackerAttack) return;

  const attackerPosition = getComponentValue(OptimisticPosition, attacker);
  if (!attackerPosition) return;

  const defenderPosition = getComponentValue(OptimisticPosition, defender);
  if (!defenderPosition) return;

  if (manhattan(attackerPosition, defenderPosition) > attackerAttack.range) return;

  const attackerEntityID = world.entities[attacker];
  const defenderEntityID = world.entities[defender];
  attackEntity(attackerEntityID, defenderEntityID);
}
