import { defineStore } from "@latticexyz/store";
import { describe, expect, it, vi } from "vitest";
import { createStash } from "../createStash";
import { subscribeStash } from "./subscribeStash";
import { setRecord } from "./setRecord";
import { deleteRecord } from "./deleteRecord";

describe("subscribeStash", () => {
  it("should notify subscriber of any stash change", async () => {
    vi.useFakeTimers({ toFake: ["queueMicrotask"] });

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
    vi.advanceTimersToNextTimer();

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
    vi.advanceTimersToNextTimer();

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
    vi.advanceTimersToNextTimer();

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

    deleteRecord({ stash, table: config.tables.namespace2__table2, key: { a: "0x01" } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toHaveBeenCalledTimes(4);
    expect(subscriber).toHaveBeenNthCalledWith(4, {
      config: {},
      records: {
        namespace2: {
          table2: {
            "0x01": {
              prev: { a: "0x01", b: 1n, c: 3 },
              current: undefined,
            },
          },
        },
      },
    });
  });

  it("should notify subscriber of singleton table changes", () => {
    vi.useFakeTimers({ toFake: ["queueMicrotask"] });

    const config = defineStore({
      namespaces: {
        app: {
          tables: {
            config: {
              schema: { enabled: "bool" },
              key: [],
            },
          },
        },
      },
    });

    const stash = createStash(config);
    const subscriber = vi.fn();

    subscribeStash({ stash, subscriber });

    setRecord({ stash, table: config.tables.app__config, key: {}, value: { enabled: true } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenNthCalledWith(1, {
      config: {},
      records: {
        app: {
          config: {
            "": {
              prev: undefined,
              current: { enabled: true },
            },
          },
        },
      },
    });

    setRecord({ stash, table: config.tables.app__config, key: {}, value: { enabled: false } });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenNthCalledWith(2, {
      config: {},
      records: {
        app: {
          config: {
            "": {
              prev: { enabled: true },
              current: { enabled: false },
            },
          },
        },
      },
    });

    deleteRecord({ stash, table: config.tables.app__config, key: {} });
    vi.advanceTimersToNextTimer();

    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber).toHaveBeenNthCalledWith(3, {
      config: {},
      records: {
        app: {
          config: {
            "": {
              prev: { enabled: false },
              current: undefined,
            },
          },
        },
      },
    });
  });
});
