import { Table } from "@latticexyz/config";
import { Key } from "../common";

export type EncodeKeyArgs<table extends Table = Table> = {
  table: table;
  key: Key<table>;
};

export type EncodeKeyResult = string;

/**
 * Encode a key object into a string that can be used as index in the store
 * TODO: Benchmark performance of this function
 */
export function encodeKey<table extends Table>({ table, key }: EncodeKeyArgs<table>): EncodeKeyResult {
  const { key: keyOrder } = table;

  return keyOrder
    .map((keyName) => {
      const keyValue = key[keyName as never];
      if (keyValue == null) {
        throw new Error(`Provided key is missing field ${keyName}.`);
      }
      return keyValue;
    })
    .join("|");
}
