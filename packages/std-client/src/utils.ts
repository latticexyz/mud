import Phaser from "phaser";
import {
  Component,
  ComponentValue,
  EntityID,
  EntityIndex,
  getComponentValue,
  getComponentValueStrict,
  getEntitiesWithValue,
  Has,
  hasComponent,
  HasValue,
  runQuery,
  Schema,
  Type,
  World,
} from "@latticexyz/recs";
import { Coord, keccak256 } from "@latticexyz/utils";
import { BigNumber, ethers } from "ethers";
import { Clock } from "@latticexyz/network";

// export function getPlayerEntity(personaComponent: Component<{ value: Type.String }>, personaId: number) {
//   const playerEntitySet = getEntitiesWithValue(personaComponent, {
//     value: ethers.BigNumber.from(personaId).toHexString(),
//   });
//   return [...playerEntitySet][0];
// }

export const GodID = keccak256("ember.god") as EntityID;

export function getCurrentTurn(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>,
  clock: Clock
) {
  const gameConfig = getGameConfig(world, gameConfigComponent);
  if (!gameConfig) return -1;

  const startTime = BigNumber.from(gameConfig.startTime);
  const turnLength = BigNumber.from(gameConfig.turnLength);

  return BigNumber.from(clock.currentTime / 1000)
    .sub(startTime)
    .div(turnLength)
    .toNumber();
}

export function getGameConfig(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>
) {
  const godEntityIndex = world.entityToIndex.get(GodID);
  if (!godEntityIndex) return null;

  return getComponentValueStrict(gameConfigComponent, godEntityIndex);
}

export function isUntraversable(
  untraversableComponent: Component<{ value: Type.Boolean }>,
  positionComponent: Component<{ x: Type.Number; y: Type.Number }>,
  targetPosition: Coord
): boolean {
  const untraversableEntitiesAtPosition = runQuery([
    HasValue(positionComponent, targetPosition),
    Has(untraversableComponent),
  ]);
  return untraversableEntitiesAtPosition.size > 0;
}

export function isOwnedByCaller(
  ownedByComponent: Component<{ value: Type.Entity }, { contractId: string }>,
  entity: EntityIndex,
  playerEntity: EntityIndex,
  entityToIndex: Map<EntityID, EntityIndex>
): boolean {
  let tempId = getComponentValue(ownedByComponent, entity)?.value;
  let tempIndex: EntityIndex | undefined;
  while (tempId) {
    tempIndex = entityToIndex.get(tempId);
    if (!tempIndex) break;
    entity = tempIndex;
    tempId = getComponentValue(ownedByComponent, entity)?.value;
  }

  if (entity === playerEntity) return true;
  return false;
}

export function getPlayerEntity(
  address: string | undefined,
  entityToIndex: Map<EntityID, EntityIndex>,
  Player: Component<{ value: Type.Boolean }, { contractId: string }>
): EntityIndex | undefined {
  if (!address) {
    return;
  }
  const playerEntity = entityToIndex.get(address as EntityID);
  if (playerEntity != null && hasComponent(Player, playerEntity)) {
    return playerEntity;
  }
}

export function randomColor(id: string): number {
  const randSeed = new Array(4); // Xorshift: [x, y, z, w] 32 bit values
  function seedRand(seed: string) {
    for (let i = 0; i < randSeed.length; i++) {
      randSeed[i] = 0;
    }
    for (let i = 0; i < seed.length; i++) {
      randSeed[i % 4] = (randSeed[i % 4] << 5) - randSeed[i % 4] + seed.charCodeAt(i);
    }
  }

  function rand() {
    const t = randSeed[0] ^ (randSeed[0] << 11);
    randSeed[0] = randSeed[1];
    randSeed[1] = randSeed[2];
    randSeed[2] = randSeed[3];
    randSeed[3] = randSeed[3] ^ (randSeed[3] >> 19) ^ t ^ (t >> 8);
    return (randSeed[3] >>> 0) / ((1 << 31) >>> 0);
  }

  function createColor() {
    // hue is the whole color spectrum
    const h = Math.floor(rand() * 360) / 360;
    //saturation goes from 40 to 100, it avoids greyish colors
    // --> Multiply by 0.75 to limit saturation
    // const s = ((rand() * 60 + 40) / 100) * 0.75;
    const s = 80 / 100;
    // lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
    // --> Multiply by 0.65 to shift
    // const l = (((rand() + rand() + rand() + rand()) * 25) / 100) * 0.65;
    const l = 70 / 100;
    return { h, s, l };
  }
  seedRand(id);
  const { h, s, l } = createColor();
  return Phaser.Display.Color.HSLToColor(h, s, l).color;
}

export function getAddressColor(address: string) {
  return randomColor(keccak256(address).substring(2));
}
