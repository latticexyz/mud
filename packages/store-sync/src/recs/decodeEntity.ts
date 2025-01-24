import { Entity } from "@latticexyz/recs";
import { Hex, decodeAbiParameters } from "viem";
import { entityToHexKeyTuple } from "./entityToHexKeyTuple";
import { KeySchema, SchemaToPrimitives } from "@latticexyz/protocol-parser/internal";
import { LruMap } from "@latticexyz/common";

const caches = new Map<KeySchema, LruMap<Entity, SchemaToPrimitives<KeySchema>>>();

function getCache<keySchema extends KeySchema>(keySchema: keySchema): LruMap<Entity, SchemaToPrimitives<keySchema>> {
  const cache = caches.get(keySchema);
  if (cache != null) return cache as never;

  const map = new LruMap<Entity, SchemaToPrimitives<keySchema>>(8096);
  caches.set(keySchema, map);
  return map;
}

export function _decodeEntity<keySchema extends KeySchema>(
  keySchema: keySchema,
  entity: Entity,
): SchemaToPrimitives<keySchema> {
  const hexKeyTuple = entityToHexKeyTuple(entity);
  if (hexKeyTuple.length !== Object.keys(keySchema).length) {
    throw new Error(
      `entity key tuple length ${hexKeyTuple.length} does not match key schema length ${Object.keys(keySchema).length}`,
    );
  }
  return Object.fromEntries(
    Object.entries(keySchema).map(([key, type], index) => [
      key,
      decodeAbiParameters([{ type }], hexKeyTuple[index] as Hex)[0],
    ]),
  ) as never;
}

// decoding can get expensive if we have thousands of entities, so we use a cache to ease this
export function decodeEntity<keySchema extends KeySchema>(
  keySchema: keySchema,
  entity: Entity,
): SchemaToPrimitives<keySchema> {
  const cache = getCache(keySchema);

  const cached = cache.get(entity);
  if (cached != null) {
    return cached as never;
  }

  const hexKeyTuple = entityToHexKeyTuple(entity);
  if (hexKeyTuple.length !== Object.keys(keySchema).length) {
    throw new Error(
      `entity key tuple length ${hexKeyTuple.length} does not match key schema length ${Object.keys(keySchema).length}`,
    );
  }
  const decoded = _decodeEntity(keySchema, entity);
  cache.set(entity, decoded);
  return decoded;
}
