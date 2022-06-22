import { Component, getEntitiesWithValue, Schema } from "@latticexyz/recs";
import { ethers } from "ethers";

export function getPlayerEntity(personaComponent: Component<Schema>, personaId: number) {
  const playerEntitySet = getEntitiesWithValue(personaComponent, {
    value: ethers.BigNumber.from(personaId).toHexString(),
  });
  return [...playerEntitySet][0];
}
