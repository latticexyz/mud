import { Entity } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";
import { Hex, decodeAbiParameters } from "viem";
import { SchemaToPrimitives } from "../common";

export function decodeEntity<TKeySchema extends Record<string, StaticAbiType>>(
  keySchema: TKeySchema,
  entity: Entity
): SchemaToPrimitives<TKeySchema> {
  const entityWithoutPrefix = entity.replace(/^entity:/, "");
  const encodedKeyTuple = entityWithoutPrefix.length > 0 ? entityWithoutPrefix.split(":") : [];
  if (encodedKeyTuple.length !== Object.keys(keySchema).length) {
    throw new Error(
      `entity key tuple length ${encodedKeyTuple.length} does not match key schema length ${
        Object.keys(keySchema).length
      }`
    );
  }
  return Object.fromEntries(
    Object.entries(keySchema).map(([key, type], index) => [
      key,
      decodeAbiParameters([{ type }], encodedKeyTuple[index] as Hex)[0],
    ])
  ) as SchemaToPrimitives<TKeySchema>;
}
