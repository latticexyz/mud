import { describe, it } from "vitest";
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../test-data/world-logs-skystrife.json";
import { resolveConfig } from "@latticexyz/store";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStore } from "./createStore";
import { logsToBlocks } from "../../test/logsToBlocks";

const tables = resolveConfig(mudConfig).tables;

const blocks = logsToBlocks(worldRpcLogs);

describe("createStorageAdapter", () => {
  it("sets component values from logs", async () => {
    const useStore = createStore({ tables });
    const storageAdapter = createStorageAdapter({ store: useStore });

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });
});
