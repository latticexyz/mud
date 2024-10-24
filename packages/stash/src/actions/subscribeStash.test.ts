import { defineStore } from "@latticexyz/store";
import { describe, expect, it, vi } from "vitest";
import { createStash } from "../createStash";
import { subscribeStash } from "./subscribeStash";
import { setRecord } from "./setRecord";

describe("subscribeStash", () => {
  it("should notify subscriber of any stash change", () => {
    const config = defineStore({
      namespaces: {
        namespace1: {
          tables: {
            table1: {
              schema: { a: "address", b: "uint256", c: "uint32" },
              key: ["a"],
            },
          },
        },
        namespace2: {
          tables: {
            table2: {
              schema: { a: "address", b: "uint256", c: "uint32" },
              key: ["a"],
            },
          },
        },
      },
    });

    const stash = createStash(config);
    const subscriber = vi.fn();

    subscribeStash({ stash, subscriber });

    setRecord({ stash, table: config.tables.namespace1__table1, key: { a: "0x00" }, value: { b: 1n, c: 2 } });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenNthCalledWith(1, {
      config: {},
      records: {
        namespace1: {
          table1: {
            "0x00": {
              prev: undefined,
              current: { a: "0x00", b: 1n, c: 2 },
            },
          },
        },
      },
    });

    setRecord({ stash, table: config.tables.namespace2__table2, key: { a: "0x01" }, value: { b: 1n, c: 2 } });

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenNthCalledWith(2, {
      config: {},
      records: {
        namespace2: {
          table2: {
            "0x01": {
              prev: undefined,
              current: { a: "0x01", b: 1n, c: 2 },
            },
          },
        },
      },
    });

    setRecord({ stash, table: config.tables.namespace2__table2, key: { a: "0x01" }, value: { b: 1n, c: 3 } });

    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber).toHaveBeenNthCalledWith(3, {
      config: {},
      records: {
        namespace2: {
          table2: {
            "0x01": {
              prev: { a: "0x01", b: 1n, c: 2 },
              current: { a: "0x01", b: 1n, c: 3 },
            },
          },
        },
      },
    });
  });
});
