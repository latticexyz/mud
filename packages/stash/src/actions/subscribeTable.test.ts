import { defineStore } from "@latticexyz/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStash } from "../createStash";
import { subscribeTable } from "./subscribeTable";
import { setRecord } from "./setRecord";

describe("subscribeTable", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["queueMicrotask"] });
    return () => {
      vi.useRealTimers();
    };
  });

  it("should notify subscriber of table change", () => {
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

    const table1 = config.namespaces.namespace1.tables.table1;
    const table2 = config.namespaces.namespace2.tables.table2;
    const stash = createStash(config);
    const subscriber = vi.fn();

    subscribeTable({ stash, table: table1, subscriber });

    setRecord({ stash, table: table1, key: { a: "0x00" }, value: { b: 1n, c: 2 } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenNthCalledWith(1, [
      {
        table: table1,
        key: { a: "0x00" },
        previous: undefined,
        current: { a: "0x00", b: 1n, c: 2 },
      },
    ]);

    // Expect unrelated updates to not notify subscribers
    setRecord({ stash, table: table2, key: { a: "0x01" }, value: { b: 1n, c: 2 } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toHaveBeenCalledTimes(1);

    setRecord({ stash, table: table1, key: { a: "0x00" }, value: { b: 1n, c: 3 } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenNthCalledWith(2, [
      {
        table: table1,
        key: { a: "0x00" },
        previous: { a: "0x00", b: 1n, c: 2 },
        current: { a: "0x00", b: 1n, c: 3 },
      },
    ]);
  });
});
