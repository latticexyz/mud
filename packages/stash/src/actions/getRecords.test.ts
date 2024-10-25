import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { setRecord } from "./setRecord";
import { attest } from "@ark/attest";
import { getRecords } from "./getRecords";

describe("getRecords", () => {
  describe("with stash", () => {
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
      const stash = createStash(config);

      setRecord({ stash, table, key: { player: 1, match: 2 }, value: { x: 3n, y: 4n } });
      setRecord({ stash, table, key: { player: 5, match: 6 }, value: { x: 7n, y: 8n } });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        getRecords({ stash, table }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
        "5|6": { player: 5, match: 6, x: 7n, y: 8n },
      });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        getRecords({ stash, table, keys: [{ player: 1, match: 2 }] }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
      });
    });
  });

  describe("with state", () => {
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
      const stash = createStash(config);

      setRecord({ stash, table, key: { player: 1, match: 2 }, value: { x: 3n, y: 4n } });
      setRecord({ stash, table, key: { player: 5, match: 6 }, value: { x: 7n, y: 8n } });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        getRecords({ state: stash.get(), table }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
        "5|6": { player: 5, match: 6, x: 7n, y: 8n },
      });

      attest<{ [encodedKey: string]: { player: number; match: number; x: bigint; y: bigint } }>(
        getRecords({ state: stash.get(), table, keys: [{ player: 1, match: 2 }] }),
      ).equals({
        "1|2": { player: 1, match: 2, x: 3n, y: 4n },
      });
    });
  });
});
