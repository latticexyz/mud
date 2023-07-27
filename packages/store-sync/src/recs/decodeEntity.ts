import { Entity } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";
import { Hex, decodeAbiParameters } from "viem";
import { SchemaToPrimitives } from "../common";
import { entityToHexKeyTuple } from "./entityToHexKeyTuple";

export function decodeEntity<TKeySchema extends Record<string, StaticAbiType>>(
  keySchema: TKeySchema,
  entity: Entity
): SchemaToPrimitives<TKeySchema> {
  const hexKeyTuple = entityToHexKeyTuple(entity);
  if (hexKeyTuple.length !== Object.keys(keySchema).length) {
    throw new Error(
      `entity key tuple length ${hexKeyTuple.length} does not match key schema length ${Object.keys(keySchema).length}`
    );
  }
  return Object.fromEntries(
    Object.entries(keySchema).map(([key, type], index) => [
      key,
      decodeAbiParameters([{ type }], hexKeyTuple[index] as Hex)[0],
    ])
  ) as SchemaToPrimitives<TKeySchema>;
}
