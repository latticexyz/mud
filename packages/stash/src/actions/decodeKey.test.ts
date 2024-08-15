import { describe, it } from "vitest";
import { createStash } from "../createStash";
import { defineStore } from "@latticexyz/store/config/v2";
import { setRecord } from "./setRecord";
import { encodeKey } from "./encodeKey";
import { attest } from "@ark/attest";
import { decodeKey } from "./decodeKey";

describe("decodeKey", () => {
  it("should decode an encoded table key", () => {
    const config = defineStore({
      namespace: "namespace1",
      tables: {
        table1: {
          schema: { field1: "string", field2: "uint32", field3: "uint256" },
          key: ["field2", "field3"],
        },
      },
    });
    const stash = createStash(config);
    const table = config.namespaces.namespace1.tables.table1;
    const key = { field2: 1, field3: 2n };
    setRecord({ stash, table, key, record: { field1: "hello" } });

    const encodedKey = encodeKey({ table, key });
    attest<typeof key>(decodeKey({ stash, table, encodedKey })).equals({ field2: 1, field3: 2n });
  });
});
