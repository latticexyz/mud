import { Entity } from "@latticexyz/recs";
import { Hex, decodeAbiParameters } from "viem";
import { entityToHexKeyTuple } from "../recs";
import { SchemaToPrimitives, Table } from "@latticexyz/store";

export function decodeEntity<table extends Table>(
  keySchema: table["keySchema"],
  entity: Entity
): SchemaToPrimitives<table["keySchema"]> {
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
  ) as SchemaToPrimitives<table["keySchema"]>;
}
