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
    api: { attackEntity, rangedAttack },
    components: { Position, Combat, RangedCombat },
    utils: { checkOwnEntity },
  } = network;

  const OptimisticPosition = actions.withOptimisticUpdates(Position);

  if (!checkOwnEntity(attacker)) return;

  const attackerEntityID = world.entities[attacker];
  const defenderEntityID = world.entities[defender];

  const attackerPosition = getComponentValue(OptimisticPosition, attacker);
  if (!attackerPosition) return;

  const defenderPosition = getComponentValue(OptimisticPosition, defender);
  if (!defenderPosition) return;

  const distanceToTarget = manhattan(attackerPosition, defenderPosition);
  const attackerRangedCombat = getComponentValue(RangedCombat, attacker);
  if (attackerRangedCombat) {
    if (distanceToTarget > attackerRangedCombat.maxRange || distanceToTarget < attackerRangedCombat.minRange) return;

    rangedAttack(attackerEntityID, defenderEntityID);
  } else {
    const attackerCombat = getComponentValue(Combat, attacker);
    if (!attackerCombat) return;

    if (distanceToTarget > 1) return;

    attackEntity(attackerEntityID, defenderEntityID);
  }
}
