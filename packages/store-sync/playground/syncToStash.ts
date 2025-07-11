import { defineWorld } from "@latticexyz/world";
import { snapshotJson } from "./snapshot";
import { createStash, Matches, runQuery } from "@latticexyz/stash/internal";
import { syncToStash } from "@latticexyz/store-sync/stash/syncToStash";
import { redstone as redstoneBase } from "@latticexyz/common/chains";
import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { deferred } from "@latticexyz/utils";

const config = defineWorld({
  tables: {
    InventorySlot: {
      schema: {
        owner: "bytes32",
        slot: "uint16",
        entityId: "bytes32",
        objectType: "uint16",
        amount: "uint16",
      },
      key: ["owner", "slot"],
    },
  },
});

const tables = config.tables;

function bigIntReviver(key: string, value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("BigInt:")) {
      return BigInt(value.substring("BigInt:".length));
    }
    return value;
  }
  return value;
}

console.log("parsing snapshot");
const jsonStart = performance.now();
const { initialBlockLogs } = JSON.parse(snapshotJson as string, bigIntReviver) as {
  initialBlockLogs: StorageAdapterBlock;
};
const jsonDuration = performance.now() - jsonStart;
console.log("snapshot parsed with", initialBlockLogs.logs.length, "logs in", jsonDuration.toFixed(2), "ms");

const stash = createStash(config);

const redstone = {
  ...redstoneBase,
  rpcUrls: {
    ...redstoneBase.rpcUrls,
    wiresaw: { webSocket: ["wss://wiresaw.redstonechain.com"], http: ["https://wiresaw.redstonechain.com"] },
  },
};

const chain = redstone;
const address = "0x253eb85B3C953bFE3827CC14a151262482E7189C"; // DUST

console.log("syncing to stash");
const syncStart = performance.now();
const result = await syncToStash({
  stash,
  internal_clientOptions: {
    chain,
    validateBlockRange: true,
  },
  address,
  initialBlockLogs,
  enableHydrationChunking: false,
});

const [setSynced, , synced] = deferred<void>();

// Start sync
const sub = result.storedBlockLogs$.subscribe((block) => {
  console.log("stored block logs", block.blockNumber, block.logs.length);
  setSynced();
});

await synced;
const syncDuration = performance.now() - syncStart;
console.log("synced in", syncDuration.toFixed(2), "ms");

result.stopSync();
sub.unsubscribe();

console.log("synced");

const entityId = "0x000000000000000000000000000000000000000000000000000000000000194b";
const queryStart = performance.now();
const queryResult = runQuery({ stash, query: [Matches(tables.InventorySlot, { entityId })] });
const queryDuration = performance.now() - queryStart;
console.log("result in", queryDuration.toFixed(2), "ms: ", queryResult);
