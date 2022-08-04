import Phaser from "phaser";
import {
  Component,
  EntityID,
  EntityIndex,
  getComponentValue,
  getComponentValueStrict,
  Has,
  hasComponent,
  HasValue,
  runQuery,
  Type,
  World,
  Schema,
  ComponentValue,
  componentValueEquals,
} from "@latticexyz/recs";
import { Coord, keccak256 } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { Clock } from "@latticexyz/network";
import { deferred } from "@latticexyz/utils";
import { filter } from "rxjs";

export const GodID = keccak256("mudwar.god") as EntityID;

export function getCurrentTurn(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>,
  clock: Clock
) {
  return getTurnAtTime(world, gameConfigComponent, clock.currentTime);
}

export function getTurnAtTime(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String }>,
  time: number
) {
  const gameConfig = getGameConfig(world, gameConfigComponent);
  if (!gameConfig) return -1;

  const startTime = BigNumber.from(gameConfig.startTime);
  const turnLength = BigNumber.from(gameConfig.turnLength);

  return BigNumber.from(Math.floor(time / 1000))
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

  return entity === playerEntity;
}

export function getPlayerEntity(
  address: string | undefined,
  world: World,
  Player: Component<{ value: Type.Boolean }, { contractId: string }>
): EntityIndex | undefined {
  if (!address) return;

  const playerEntity = world.entityToIndex.get(address as EntityID);
  if (playerEntity == null || !hasComponent(Player, playerEntity)) return;

  return playerEntity;
}

export function resolveRelationshipChain(
  entity: EntityIndex,
  world: World,
  relationshipComponent: Component<{ value: Type.Entity }, { contractId: string }>
): EntityIndex | undefined {
  while (hasComponent(relationshipComponent, entity)) {
    const entityValue = world.entityToIndex.get(getComponentValueStrict(relationshipComponent, entity).value);
    if (!entityValue) return;
    entity = entityValue;
  }
  return entity;
}

export function getOwningPlayer(
  entity: EntityIndex,
  world: World,
  Player: Component<{ value: Type.Boolean }, { contractId: string }>,
  OwnedBy: Component<{ value: Type.Entity }, { contractId: string }>
): EntityIndex | undefined {
  const playerEntity = resolveRelationshipChain(entity, world, OwnedBy);
  if (playerEntity == null || !hasComponent(Player, playerEntity)) return;

  return playerEntity;
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

export function waitForComponentValueIn<S extends Schema>(
  component: Component<S>,
  entity: EntityIndex,
  values: Partial<ComponentValue<S>>[]
): Promise<void> {
  const [resolve, , promise] = deferred<void>();

  let dispose = resolve;
  const subscription = component.update$
    .pipe(
      filter((e) => e.entity === entity && Boolean(values.find((value) => componentValueEquals(value, e.value[0]))))
    )
    .subscribe(() => {
      resolve();
      dispose();
    });

  dispose = () => subscription?.unsubscribe();

  return promise;
}

export async function waitForComponentValue<S extends Schema>(
  component: Component<S>,
  entity: EntityIndex,
  value: Partial<ComponentValue<S>>
): Promise<void> {
  await waitForComponentValueIn(component, entity, [value]);
}
