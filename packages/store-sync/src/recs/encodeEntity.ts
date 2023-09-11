import { Entity } from "@latticexyz/recs";
import { encodeAbiParameters } from "viem";
import { KeySchema, SchemaToPrimitives } from "@latticexyz/protocol-parser";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";

export function encodeEntity<TKeySchema extends KeySchema>(
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
