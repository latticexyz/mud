import { Entity } from "@latticexyz/recs";
import { StaticAbiType } from "@latticexyz/schema-type";
import { encodeAbiParameters } from "viem";
import { SchemaToPrimitives } from "@latticexyz/store";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";

export function encodeEntity<TKeySchema extends Record<string, StaticAbiType>>(
  keySchema: TKeySchema,
  key: SchemaToPrimitives<TKeySchema>
): Entity {
  if (Object.keys(keySchema).length !== Object.keys(key).length) {
    throw new Error(
      `key length ${Object.keys(key).length} does not match key schema length ${Object.keys(keySchema).length}`
    );
  }
  return hexKeyTupleToEntity(
    Object.entries(keySchema).map(([keyName, type]) => encodeAbiParameters([{ type }], [key[keyName]]))
  );
}
