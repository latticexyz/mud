import { defineStore } from "@latticexyz/store";
import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { setRecord } from "./setRecord";
import { attest } from "@ark/attest";
import { getKeys } from "./getKeys";

describe("getKeys", () => {
  it("should return the key map of a table", () => {
    const config = defineStore({
      tables: {
        test: {
          schema: {
            player: "int32",
            match: "int32",
            x: "int32",
            y: "int32",
          },
          key: ["player", "match"],
        },
      },
    });
    const table = config.tables.test;
    const stash = createStash(config);

    setRecord({ stash, table, key: { player: 1, match: 2 }, record: { x: 3, y: 4 } });
    setRecord({ stash, table, key: { player: 5, match: 6 }, record: { x: 7, y: 8 } });

    attest<{ [encodedKey: string]: { player: number; match: number } }>(getKeys({ stash, table })).snap({
      "1|2": { player: 1, match: 2 },
      "5|6": { player: 5, match: 6 },
    });
  });
});
