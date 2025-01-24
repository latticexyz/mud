import { Entity } from "@latticexyz/recs";
import { encodeAbiParameters } from "viem";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { KeySchema, SchemaToPrimitives } from "@latticexyz/protocol-parser/internal";
import { LruMap } from "@latticexyz/common";

const caches = new Map<KeySchema, LruMap<SchemaToPrimitives<KeySchema>, Entity>>();

function getCache<keySchema extends KeySchema>(keySchema: keySchema): LruMap<SchemaToPrimitives<keySchema>, Entity> {
  const cache = caches.get(keySchema);
  if (cache != null) return cache as never;

  const map = new LruMap<SchemaToPrimitives<keySchema>, Entity>(8096);
  caches.set(keySchema, map);
  return map;
}

export function _encodeEntity<keySchema extends KeySchema>(
  keySchema: keySchema,
  key: SchemaToPrimitives<keySchema>,
): Entity {
  if (Object.keys(keySchema).length !== Object.keys(key).length) {
    throw new Error(
      `key length ${Object.keys(key).length} does not match key schema length ${Object.keys(keySchema).length}`,
    );
  }
  return hexKeyTupleToEntity(
    Object.entries(keySchema).map(([keyName, type]) => encodeAbiParameters([{ type }], [key[keyName]])),
  );
}

// encoding can get expensive if we have thousands of entities, so we use a cache to ease this
export function encodeEntity<keySchema extends KeySchema>(
  keySchema: keySchema,
  key: SchemaToPrimitives<keySchema>,
): Entity {
  const cache = getCache(keySchema);

  const cached = cache.get(key);
  if (cached != null) {
    return cached as never;
  }

  const encoded = _encodeEntity(keySchema, key);
  cache.set(key, encoded);
  return encoded;
}
