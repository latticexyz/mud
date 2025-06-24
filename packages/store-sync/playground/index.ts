import { redstone as redstoneBase } from "@latticexyz/common/chains";
import { createStoreSync } from "../src/createStoreSync";
// import { watchLogs } from "../src/watchLogs";
import { createPublicClient, http } from "viem";

const redstone = {
  ...redstoneBase,
  rpcUrls: {
    ...redstoneBase.rpcUrls,
    wiresaw: { webSocket: ["wss://wiresaw.redstonechain.com"], http: ["https://wiresaw.redstonechain.com"] },
  },
};

const client = createPublicClient({ chain: redstone, transport: http() });
const latestBlock = await client.getBlockNumber();
console.log("latestBlock", latestBlock);
const result = await createStoreSync({
  internal_clientOptions: {
    chain: redstone,
    validateBlockRange: true,
  },
  address: "0x253eb85B3C953bFE3827CC14a151262482E7189C",
  initialBlockLogs: {
    blockNumber: latestBlock - 1000n,
    logs: [],
  },
  enableHydrationChunking: false,
  storageAdapter: async (block) => {
    console.log("storageAdapter", { blockNumber: block.blockNumber, logs: block.logs.length });
  },
});

// Start sync
result.storedBlockLogs$.subscribe();
result.latestBlockNumber$.subscribe((blockNumber) => console.log("latestBlockNumber", blockNumber));

// const { logs$ } = watchLogs({
//   url: "wss://wiresaw.redstonechain.com",
//   fromBlock: latestBlock - 100n,
//   address: "0x253eb85B3C953bFE3827CC14a151262482E7189C",
// });

// logs$.subscribe((update) => {
//   console.log("got update", { blockNumber: update.blockNumber, logs: update.logs.length });
// });
