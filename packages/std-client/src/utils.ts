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
  Metadata,
} from "@latticexyz/recs";
import { Coord, keccak256 } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { Clock, GodID } from "@latticexyz/network";
import { deferred } from "@latticexyz/utils";
import { filter } from "rxjs";

export function getCurrentTurn(
  world: World,
  gameConfigComponent: Component<{
    startTime: Type.String;
    turnLength: Type.String;
    actionCooldownLength: Type.String;
  }>,
  clock: Clock
) {
  return getTurnAtTime(world, gameConfigComponent, clock.currentTime / 1000);
}

export function getTurnAtTime(
  world: World,
  gameConfigComponent: Component<{
    startTime: Type.String;
    turnLength: Type.String;
    actionCooldownLength: Type.String;
  }>,
  time: number
) {
  const gameConfig = getGameConfig(world, gameConfigComponent);
  if (!gameConfig) return -1;

  const startTime = BigNumber.from(gameConfig.startTime);
  const turnLength = BigNumber.from(gameConfig.turnLength);

  return BigNumber.from(Math.floor(time)).sub(startTime).div(turnLength).toNumber();
}

export function getGameConfig(
  world: World,
  gameConfigComponent: Component<{ startTime: Type.String; turnLength: Type.String; actionCooldownLength: Type.String }>
) {
  const godEntityIndex = world.entityToIndex.get(GodID);
  if (godEntityIndex == null) return;

  return getComponentValue(gameConfigComponent, godEntityIndex);
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

export function getPlayerEntity(
  address: string | undefined,
  world: World,
  Player: Component<{ value: Type.Boolean }>
): EntityIndex | undefined {
  if (!address) return;

  const playerEntity = world.entityToIndex.get(address as EntityID);
  if (playerEntity == null || !hasComponent(Player, playerEntity)) return;

  return playerEntity;
}

/**
 * Starting with the given entity, traverse the relationship chain until the end is reached.
 * @param relationshipComponent The component that will be used to traverse the relationship chain.
 * @param entity Starting entity
 * @returns The last entity in the relationship chain or undefined if the relationship chain is broken.
 */
export function resolveRelationshipChain(
  relationshipComponent: Component<{ value: Type.Entity }>,
  entity: EntityIndex
): EntityIndex | undefined {
  const { world } = relationshipComponent;

  while (hasComponent(relationshipComponent, entity)) {
    const entityValue = world.entityToIndex.get(getComponentValueStrict(relationshipComponent, entity).value);
    if (!entityValue) return;
    entity = entityValue;
  }
  return entity;
}

/**
 * Starting with the given entity, traverse the relationship chain until you find an entity that has the given component.
 * @param relationshipComponent The component that will be used to traverse the relationship chain.
 * @param entity Starting entity
 * @param searchComponent The component to search for.
 * @returns The first entity in the relationship chain that has the given component or undefined if the relationship chain is broken.
 */
export function findEntityWithComponentInRelationshipChain(
  relationshipComponent: Component<{ value: Type.Entity }>,
  entity: EntityIndex,
  searchComponent: Component
): EntityIndex | undefined {
  if (hasComponent(searchComponent, entity)) return entity;

  const { world } = relationshipComponent;

  while (hasComponent(relationshipComponent, entity)) {
    const entityValue = world.entityToIndex.get(getComponentValueStrict(relationshipComponent, entity).value);
    if (entityValue == null) return;
    entity = entityValue;

    if (hasComponent(searchComponent, entity)) return entity;
  }

  return;
}

/**
 * Find a specific entity in a relationship chain.
 * @param entity Starting entity
 * @param searchEntity Entity to search for
 * @param relationshipComponent The component that will be used to traverse the relationship chain.
 * @returns True if the entity is found in the relationship chain, false otherwise.
 */
export function findInRelationshipChain(
  relationshipComponent: Component<{ value: Type.Entity }>,
  entity: EntityIndex,
  searchEntity: EntityIndex
): boolean {
  if (entity === searchEntity) return true;

  const { world } = relationshipComponent;

  while (hasComponent(relationshipComponent, entity)) {
    const entityValue = world.entityToIndex.get(getComponentValueStrict(relationshipComponent, entity).value);
    if (entityValue == null) return false;
    entity = entityValue;

    if (entity === searchEntity) return true;
  }

  return false;
}

/**
 * Generate a random color based on the given id.
 * @param id Any string
 * @returns A color in the range 0x000000 - 0xFFFFFF
 */
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

  function createColor(): [number, number, number] {
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
    return [h, s, l];
  }

  function RgbToHex(red: number, green: number, blue: number): number {
    return (red << 16) | (green << 8) | blue;
  }

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function HSLToRGB(h: number, s: number, l: number): [number, number, number] {
    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
  }

  seedRand(id);

  return RgbToHex(...HSLToRGB(...createColor()));
}

export function getStringColor(address: string) {
  return randomColor(keccak256(address).substring(2));
}

export function waitForComponentValueIn<S extends Schema, T>(
  component: Component<S, Metadata, T>,
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
