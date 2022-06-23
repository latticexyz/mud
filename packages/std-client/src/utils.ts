import { Component, getComponentValue, getEntitiesWithValue, Schema, Type, World } from "@latticexyz/recs";
import { keccak256 } from "@latticexyz/utils";
import { BigNumber, ethers } from "ethers";

export function getPlayerEntity(personaComponent: Component<Schema>, personaId: number) {
  const playerEntitySet = getEntitiesWithValue(personaComponent, {
    value: ethers.BigNumber.from(personaId).toHexString(),
  });
  return [...playerEntitySet][0];
}

export const GodID = keccak256("ember.god");

export function getCurrentTurn(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>,
  atTime: BigNumber
) {
  const gameConfig = getGameConfig(world, gameConfigComponent);
  if (!gameConfig) return -1;

  const startTime = BigNumber.from(gameConfig.startTime);
  const turnLength = BigNumber.from(gameConfig.turnLength);

  return atTime.sub(startTime).div(turnLength).toNumber();
}

export function getGameConfig(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>
) {
  const godEntityIndex = world.entityToIndex.get(GodID);
  if (!godEntityIndex) return null;

  const gameConfig = getComponentValue(gameConfigComponent, godEntityIndex);
  if (!gameConfig) return null;

  return gameConfig;
}
