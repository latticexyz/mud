import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStore } from "../createStore";
import { setRecord } from "./setRecord";
import { attest } from "@ark/attest";
import { getRecords } from "./getRecords";

describe("getRecords", () => {
  it("should get all records from a table", () => {
    const config = defineStore({
      tables: {
        test: {
          schema: {
            player: "int32",
            match: "int32",
            x: "uint256",
            y: "uint256",
          },
          key: ["player", "match"],
        },
      },
    });
    const table = config.tables.test;
    const store = createStore(config);

    setRecord({ store, table, key: { player: 1, match: 2 }, record: { x: 3n, y: 4n } });
    setRecord({ store, table, key: { player: 5, match: 6 }, record: { x: 7n, y: 8n } });

    attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
      getRecords({ store, table }),
    ).equals({
      "1|2": { player: 1, match: 2, x: 3n, y: 4n },
      "5|6": { player: 5, match: 6, x: 7n, y: 8n },
    });

    attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
      getRecords({ store, table, keys: [{ player: 1, match: 2 }] }),
    ).equals({
      "1|2": { player: 1, match: 2, x: 3n, y: 4n },
    });
  });
});
