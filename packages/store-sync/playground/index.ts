import { redstone as redstoneBase, garnet as garnetBase } from "@latticexyz/common/chains";
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

const garnet = {
  ...garnetBase,
  rpcUrls: {
    ...garnetBase.rpcUrls,
    wiresaw: { webSocket: ["wss://wiresaw.garnetchain.com"], http: ["https://wiresaw.garnetchain.com"] },
  },
};

const chains = { redstone, garnet };

const chain = chains.redstone;
const address = "0x253eb85B3C953bFE3827CC14a151262482E7189C"; // REDSTONE
// const address: "0x300f19AD7a0D7ec3D7fC09ad0D34425C24ffF08F", // GARNET blockNumber: 19302351

const client = createPublicClient({ chain, transport: http() });
const latestBlock = await client.getBlockNumber();
console.log("latestBlock", latestBlock);
const result = await createStoreSync({
  internal_clientOptions: {
    chain,
    validateBlockRange: true,
  },
  address,
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
