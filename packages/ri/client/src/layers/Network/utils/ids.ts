import { Entity } from "@mud/recs";
import { LAYER_NAME } from "../constants";

/**
 * @param contractEntity Entity's id on the contract.
 * @returns Entity's id on the client
 */
export function contractToNetworkEntity(contractEntity: number) {
  return `${LAYER_NAME}/${contractEntity}`;
}

/**
 * @param entity Entity's id on the client
 * @returns Entity's id on the contract
 */
export function networkToContractEntity(entity: Entity) {
  const fragments = entity.split("/");
  if (fragments.length > 2) throw new Error("Malformatted entity");
  if (fragments[0] !== LAYER_NAME) throw new Error("Entity is unknown to the network layer");
  return parseInt(fragments[1]);
}
